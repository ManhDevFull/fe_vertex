"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

import EmptyState from "@/components/ui/EmptyState";
import { LoadingProduct } from "@/components/ui/LoadingProduct";
import { PageFilter } from "@/components/ui/Pagination";
import Product from "@/components/ui/Product";
import Loading from "@/components/ui/loading";
import { formatCurrency } from "@/utils/currency";
import { restApiBase } from "@/utils/env";
import type {
  PaginationInfo,
  PagedResultDTO,
  ProductUi,
  allvariant,
  valueFilter,
  variants,
} from "@/types/type";
import FilterSidebar from "./FilterSidebar";

type FilterProps = {
  onSetTotal: (total: number) => void;
  onSetFilterCount?: (count: number) => void;
  type: boolean;
};

type ActiveFilter = {
  key: string;
  value: string;
  label: string;
};

type AllCategory = {
  key: string;
  values: string[];
};

type RangePrice = {
  min: string;
  max: string;
};

const EMPTY_RANGE: RangePrice = { min: "", max: "" };
const DEFAULT_PAGE: PaginationInfo = { pageNumber: 1, pageSize: 20 };

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const FILTER_LABELS: Record<string, string> = {
  namecategory: "Category",
  brand: "Brand",
};

export default function Filter({ onSetTotal, onSetFilterCount, type }: FilterProps) {
  const searchParam = useSearchParams();
  const query = (searchParam.get("query") || "").trim();

  const [page, setPage] = useState<PaginationInfo>(DEFAULT_PAGE);
  const [variantApi, setVariantApi] = useState<variants[]>([]);
  const [rangePrice, setRangePrice] = useState<RangePrice>(EMPTY_RANGE);
  const [productUi, setProductUi] = useState<PagedResultDTO<ProductUi> | null>(
    null
  );
  const [selectedFilter, setSelectedFilter] = useState<valueFilter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [allVariant, setAllVariant] = useState<allvariant[] | null>(null);
  const [allCategory, setAllCategory] = useState<AllCategory | null>(null);
  const [priceError, setPriceError] = useState("");

  const selectedCategory = selectedFilter.namecategory?.[0] ?? "";
  const categories = allCategory?.values ?? [];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoryRes, variantRes] = await Promise.all([
          axios.get(`${restApiBase}category`),
          axios.get(`${restApiBase}variant/getAllVariant`),
        ]);

        setAllCategory(categoryRes.data?.[0] ?? null);
        setAllVariant(variantRes.data ?? null);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setAllCategory(null);
        setAllVariant(null);
        setVariantApi([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchVariantApi = async () => {
      if (!selectedCategory) {
        setVariantApi([]);
        return;
      }
      try {
        const res = await axios.get(`${restApiBase}variant`, {
          params: { name: selectedCategory },
        });
        setVariantApi(res.data ?? []);
      } catch (error) {
        console.error("Error fetching variants:", error);
        setVariantApi([]);
      }
    };

    fetchVariantApi();
  }, [selectedCategory]);

  useEffect(() => {
    setPage((prev) =>
      prev.pageNumber === 1 ? prev : { ...prev, pageNumber: 1 }
    );
  }, [selectedFilter, query]);

  useEffect(() => {
    let cancelled = false;

    const handleSend = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await axios.post(`${restApiBase}product/filter`, {
          filter: selectedFilter,
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          query: query,
        });

        if (cancelled) return;

        const payload = response.data as PagedResultDTO<ProductUi>;
        setProductUi(payload);
        onSetTotal(payload?.totalCount ?? 0);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (!cancelled) {
          setProductUi(null);
          onSetTotal(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProduct(false);
        }
      }
    };

    handleSend();
    return () => {
      cancelled = true;
    };
  }, [selectedFilter, page, query, onSetTotal]);

  const handleToggleFilter = (key: string, value: string) => {
    setSelectedFilter((prev) => {
      if (key === "namecategory") {
        setRangePrice(EMPTY_RANGE);
        const current = prev[key] || [];
        if (current.includes(value)) {
          return {};
        }
        return { [key]: [value] };
      }

      const currentValues = prev[key] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      if (nextValues.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [key]: nextValues };
    });
  };

  const handleApplyPrice = () => {
    if (!rangePrice.min && !rangePrice.max) {
      setPriceError("Enter a valid price range.");
      setSelectedFilter((prev) => {
        const { price, ...rest } = prev;
        return rest;
      });
      return;
    }

    const minPrice = parseInt(rangePrice.min, 10) || 0;
    const maxPrice = parseInt(rangePrice.max, 10) || 0;

    if (minPrice > maxPrice && maxPrice > 0) {
      setPriceError("Min price should be lower than max price.");
      return;
    }

    setPriceError("");
    setSelectedFilter((prev) => ({
      ...prev,
      price: [String(minPrice), String(maxPrice || 1000000000)],
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilter({});
    setRangePrice(EMPTY_RANGE);
    setVariantApi([]);
    setPriceError("");
  };

  const handleRemoveFilter = (key: string, value: string) => {
    if (key === "price") {
      setSelectedFilter((prev) => {
        const { price, ...rest } = prev;
        return rest;
      });
      setRangePrice(EMPTY_RANGE);
      setPriceError("");
      return;
    }

    handleToggleFilter(key, value);
  };

  // Build display labels for the active filter chips.
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const entries = Object.entries(selectedFilter);
    const items: ActiveFilter[] = [];

    entries.forEach(([key, values]) => {
      if (!values || values.length === 0) return;
      if (key === "price") {
        const min = values[0] ?? "0";
        const max = values[1] ?? "0";
        items.push({
          key,
          value: `${min}-${max}`,
          label: `Price: ${formatCurrency(min)} - ${formatCurrency(max)}`,
        });
        return;
      }

      values.forEach((item) => {
        items.push({
          key,
          value: item,
          label: `${FILTER_LABELS[key] ?? toTitle(key)}: ${toTitle(item)}`,
        });
      });
    });

    return items;
  }, [selectedFilter]);

  const filterCount = useMemo(() => {
    return Object.entries(selectedFilter).reduce((total, [key, values]) => {
      if (!values || values.length === 0) return total;
      if (key === "price") return total + 1;
      return total + values.length;
    }, 0);
  }, [selectedFilter]);

  useEffect(() => {
    onSetFilterCount?.(filterCount);
  }, [filterCount, onSetFilterCount]);

  const hasFilters = filterCount > 0;
  const totalCount = productUi?.totalCount ?? 0;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full px-4 md:px-16 pb-16">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
        <FilterSidebar
          categories={categories}
          allVariant={allVariant}
          variantApi={variantApi}
          selectedFilter={selectedFilter}
          rangePrice={rangePrice}
          priceError={priceError}
          hasFilters={hasFilters}
          onToggleFilter={handleToggleFilter}
          onRangeChange={(field, value) =>
            setRangePrice((prev) => ({ ...prev, [field]: value }))
          }
          onApplyPrice={handleApplyPrice}
          onClearFilters={handleClearFilters}
        />

        <div className="space-y-6">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={`${filter.key}-${filter.value}`}
                    type="button"
                    onClick={() => handleRemoveFilter(filter.key, filter.value)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                  >
                    {filter.label}
                    <span className="text-slate-400">x</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          )}

          {isLoadingProduct ? (
            <div className="flex justify-center">
              <LoadingProduct />
            </div>
          ) : totalCount > 0 ? (
            <>
              <div
                className={
                  type
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    : "space-y-4"
                }
              >
                {productUi?.items?.map((product) => (
                  <Product
                    key={product.id}
                    product={product}
                    selectedFilter={selectedFilter}
                    type={type}
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <PageFilter
                  pageprops={page}
                  onChangePage={(pageNumber, pageSize) =>
                    setPage({ pageNumber, pageSize })
                  }
                  totablPgae={productUi?.totalCount || 1}
                />
              </div>
            </>
          ) : (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              className="py-16"
            />
          )}
        </div>
      </div>
    </div>
  );
}
