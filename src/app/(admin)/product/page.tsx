"use client";

import { formatTree } from "@/app/utils/formartTree";
import handleAPI from "@/axios/handleAPI";
import axiosClient from "@/axios/axiosClient";
import ChooseModule from "@/components/modules/ChooseModal";
import ProductUpsertModal, {
  ProductFormSubmit,
} from "@/components/modules/product/ProductUpsertModal";
import VariantUpsertModal, {
  VariantFormSubmit,
} from "@/components/modules/product/VariantUpsertModal";
import ProductToolbar from "@/components/templates/Admin/Product/Toolbar";
import ProductTable from "@/components/templates/Admin/Product/Table";
import type { FilterParams, BrandItem } from "@/components/templates/Admin/filterProduct";
import Pagination from "@/components/ui/pageNavigation";
import { CategoryTree, IProductAdmin, IVariant } from "@/types/type";
import { useCallback, useEffect, useState } from "react";

type FilterState = {
  name: string;
  sort: string | "newest" | "priceAsc" | "priceDesc";
  brand: string;
  cate?: number;
  isStock: boolean;
};

const DEFAULT_FILTER: FilterState = {
  name: "",
  sort: "",
  brand: "",
  cate: undefined,
  isStock: false,
};

const PAGE_SIZE = 30;

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toStringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const parseJsonArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeVariant = (variant: any): IVariant => {
  const rawValueVariant = variant?.valuevariant;
  let valuevariant: unknown = rawValueVariant;
  if (typeof rawValueVariant === "string" && rawValueVariant.trim()) {
    try {
      valuevariant = JSON.parse(rawValueVariant);
    } catch {
      valuevariant = rawValueVariant;
    }
  }

  return {
    variant_id: toNumber(variant?.variant_id ?? variant?.id),
    product_id: toNumber(variant?.product_id ?? variant?.productId),
    valuevariant,
    stock: toNumber(variant?.stock),
    inputprice: toNumber(variant?.inputprice),
    price: toNumber(variant?.price),
    createdate: toStringValue(variant?.createdate),
    updatedate: toStringValue(variant?.updatedate ?? variant?.createdate),
    isdeleted: Boolean(variant?.isdeleted),
    sold:
      variant?.sold !== undefined && variant?.sold !== null
        ? toNumber(variant?.sold)
        : undefined,
  };
};

const normalizeProductAdmin = (item: any): IProductAdmin => {
  const imageurls = Array.isArray(item?.imageurls)
    ? item.imageurls.filter((url: unknown): url is string => typeof url === "string")
    : [];
  const variants = parseJsonArray(item?.variants).map(normalizeVariant);

  return {
    brand: toStringValue(item?.brand),
    category_id: toNumber(item?.category_id),
    category_name: toStringValue(item?.category_name),
    createdate: toStringValue(item?.createdate),
    description: toStringValue(item?.description),
    imageurls,
    max_price: toNumber(item?.max_price),
    min_price: toNumber(item?.min_price),
    name: toStringValue(item?.name),
    product_id: toNumber(item?.product_id),
    updatedate: toStringValue(item?.updatedate ?? item?.createdate),
    variant_count: toNumber(item?.variant_count),
    variants,
  };
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    const dataMessage = (error as { data?: { message?: unknown } }).data?.message;
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;

    const resolved = [maybeMessage, dataMessage, responseMessage].find(
      (msg): msg is string => typeof msg === "string" && msg.length > 0
    );

    if (resolved) {
      return resolved;
    }
  }
  return fallback;
};

export default function ProductPage() {

  const [openIds, setOpenIds] = useState<number[]>([]);
  const [isPage, setIsPage] = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [products, setProducts] = useState<IProductAdmin[]>([]);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [listCate, setListCate] = useState<CategoryTree[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [productModalSubmitting, setProductModalSubmitting] = useState(false);
  const [productModalError, setProductModalError] = useState("");
  const [editingProduct, setEditingProduct] = useState<IProductAdmin | null>(
    null
  );

  // Variant modal state
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantModalMode, setVariantModalMode] = useState<"create" | "edit">(
    "create"
  );
  const [variantModalSubmitting, setVariantModalSubmitting] = useState(false);
  const [variantModalError, setVariantModalError] = useState("");
  const [variantContext, setVariantContext] = useState<{
    product: IProductAdmin;
    variant?: IVariant;
  } | null>(null);

  // Delete confirmations
  const [productToDelete, setProductToDelete] = useState<IProductAdmin | null>(
    null
  );
  const [variantToDelete, setVariantToDelete] = useState<{
    product: IProductAdmin;
    variant: IVariant;
  } | null>(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await handleAPI("/admin/category");
        if (res.status === 200) {
          setListCate(formatTree(res.data));
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product list on filter/page changes
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      if (!cancelled) setLoadingProducts(true);

      const params = new URLSearchParams();
      params.set("page", String(isPage));
      params.set("size", String(PAGE_SIZE));

      if (filter.name) params.set("name", filter.name);
      if (filter.brand) params.set("brand", filter.brand);
      if (filter.cate !== undefined) params.set("cate", String(filter.cate));
      if (filter.sort) params.set("sort", filter.sort);
      if (filter.isStock) params.set("stock", "true");

      try {
        const res = await handleAPI(`admin/Product?${params.toString()}`);
        if (!cancelled) {
          if (res.status === 200) {
            const normalizedItems = Array.isArray(res.data?.items)
              ? res.data.items.map(normalizeProductAdmin)
              : [];
            setProducts(normalizedItems);
            setTotalItem(
              typeof res.data?.total === "number" ? res.data.total : normalizedItems.length
            );
          } else {
            setProducts([]);
            setTotalItem(0);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load products", error);
          setProducts([]);
          setTotalItem(0);
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [isPage, filter]);

  // Fetch brands whenever category filter changes
  useEffect(() => {
    let cancelled = false;
    const fetchBrands = async () => {
      const query = filter.cate !== undefined ? `?cate=${filter.cate}` : "";
      try {
        const res = await handleAPI(`/admin/category/brand${query}`);
        if (cancelled) return;
        if (res?.status === 200) {
          const items = Array.isArray(res.data) ? res.data : [];
          setBrands(items);
          if (filter.brand && !items.some((b) => b.name === filter.brand)) {
            setFilter((prev) => ({ ...prev, brand: "" }));
          }
        } else {
          setBrands([]);
        }
      } catch (error) {
        if (!cancelled) {
          setBrands([]);
        }
        console.error("Failed to load brands", error);
      }
    };
    fetchBrands();
    return () => {
      cancelled = true;
    };
  }, [filter.brand, filter.cate]);

  const matchesCurrentFilters = useCallback(
    (product: IProductAdmin) => {
      const searchTerm = (filter.name ?? "").trim().toLowerCase();
      const productName = product.name?.toLowerCase() ?? "";

      if (searchTerm && !productName.includes(searchTerm)) {
        return false;
      }
      if (filter.brand && product.brand !== filter.brand) {
        return false;
      }
      if (filter.cate !== undefined && product.category_id !== filter.cate) {
        return false;
      }
      if (filter.isStock) {
        const hasStock =
          Array.isArray(product.variants) && product.variants.some((variant) => (variant.stock ?? 0) > 0);
        if (!hasStock) {
          return false;
        }
      }
      return true;
    },
    [filter]
  );

  const sortByCurrentFilters = useCallback(
    (list: IProductAdmin[]) => {
      const sorted = [...list];
      const activeSort = filter.sort || "newest";

      const normalizeDate = (value?: string) => {
        if (!value) return 0;
        const timestamp = new Date(value).getTime();
        return Number.isFinite(timestamp) ? timestamp : 0;
      };
      const normalizePriceAsc = (price: number | null | undefined) =>
        typeof price === "number" ? price : Number.MAX_SAFE_INTEGER;
      const normalizePriceDesc = (price: number | null | undefined) =>
        typeof price === "number" ? price : Number.MIN_SAFE_INTEGER;

      switch (activeSort) {
        case "priceAsc":
          sorted.sort((a, b) => {
            const diff = normalizePriceAsc(a.min_price) - normalizePriceAsc(b.min_price);
            return diff !== 0 ? diff : a.product_id - b.product_id;
          });
          break;
        case "priceDesc":
          sorted.sort((a, b) => {
            const priceA = normalizePriceDesc(a.max_price ?? a.min_price);
            const priceB = normalizePriceDesc(b.max_price ?? b.min_price);
            const diff = priceB - priceA;
            return diff !== 0 ? diff : b.product_id - a.product_id;
          });
          break;
        default:
          sorted.sort((a, b) => {
            const timeA = normalizeDate(a.createdate ?? a.updatedate);
            const timeB = normalizeDate(b.createdate ?? b.updatedate);
            const diff = timeB - timeA;
            return diff !== 0 ? diff : b.product_id - a.product_id;
          });
          break;
      }
      return sorted;
    },
    [filter.sort]
  );

  const handleFilterChange = useCallback(
    (f: FilterParams) => {
      const brandName =
        f.brandId && f.brandId !== ""
          ? brands.find((b) => String(b.id) === f.brandId)?.name ?? ""
          : "";
      setFilter({
        name: f.q,
        brand: brandName,
        cate: f.categoryId ? Number(f.categoryId) : undefined,
        isStock: f.inStockOnly,
        sort: f.sort,
      });
      setIsPage(1);
    },
    [brands]
  );

  const toggleOpen = (id: number) =>
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const ensureRowExpanded = (productId: number) => {
    setOpenIds((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
  };

  const openCreateProductModal = () => {
    setProductModalMode("create");
    setEditingProduct(null);
    setProductModalError("");
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: IProductAdmin) => {
    setProductModalMode("edit");
    setEditingProduct(product);
    setProductModalError("");
    setProductModalOpen(true);
  };

  const applyProductUpdate = (
    responseProduct: IProductAdmin,
    mode: "create" | "edit",
    previousProduct?: IProductAdmin | null
  ) => {
    const previouslyMatched = previousProduct
      ? matchesCurrentFilters(previousProduct)
      : false;
    const nowMatches = matchesCurrentFilters(responseProduct);

    let pendingDelta = 0;
    let removedProductId: number | null = null;

    setProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === responseProduct.product_id
      );

      if (!nowMatches) {
        if (existingIndex !== -1 && previouslyMatched) {
          removedProductId = responseProduct.product_id;
          pendingDelta = mode === "edit" ? -1 : 0;
          return prev.filter((_, idx) => idx !== existingIndex);
        }
        return prev;
      }

      if (existingIndex !== -1) {
        const updatedList = [...prev];
        updatedList[existingIndex] = responseProduct;
        const requiresResort =
          filter.sort === "priceAsc" || filter.sort === "priceDesc";
        return requiresResort
          ? sortByCurrentFilters(updatedList)
          : updatedList;
      }

      if (mode === "create") {
        pendingDelta = 1;
        if (isPage === 1) {
          const updatedList = sortByCurrentFilters([responseProduct, ...prev]);
          return updatedList.slice(0, PAGE_SIZE);
        }
        return prev;
      }

      if (!previouslyMatched) {
        pendingDelta = 1;
      }

      return prev;
    });

    if (removedProductId !== null) {
      const removedId = removedProductId;
      setOpenIds((prev) =>
        prev.includes(removedId) ? prev.filter((id) => id !== removedId) : prev
      );
    }

    if (pendingDelta !== 0) {
      setTotalItem((prev) => Math.max(0, prev + pendingDelta));
    }
  };

  const removeProductFromState = (productId: number) => {
    let removed = false;
    setProducts((prev) => {
      const next = prev.filter((item) => item.product_id !== productId);
      removed = next.length !== prev.length;
      return next;
    });
    setOpenIds((prev) => prev.filter((id) => id !== productId));
    if (removed) {
      setTotalItem((prev) => Math.max(0, prev - 1));
    }
  };

  const handleProductSubmit = async (payload: ProductFormSubmit) => {
    setProductModalSubmitting(true);
    setProductModalError("");
    try {
      let endpoint = "/admin/Product";
      let method: "post" | "put" = "post";

      if (productModalMode === "edit" && editingProduct) {
        endpoint = `/admin/Product/${editingProduct.product_id}`;
        method = "put";
      }

      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("brandId", String(payload.brandId));
      formData.append("categoryId", String(payload.categoryId));

      payload.existingImageUrls.forEach((url) => {
        formData.append("existingImageUrls", url);
      });

      payload.newImages.forEach((file) => {
        formData.append("newImages", file);
      });

      let shouldUpdateImages = payload.newImages.length > 0;
      if (!shouldUpdateImages && productModalMode === "edit" && editingProduct) {
        const originalUrls = editingProduct.imageurls ?? [];
        if (payload.existingImageUrls.length !== originalUrls.length) {
          shouldUpdateImages = true;
        } else {
          const originalSet = new Set(originalUrls);
          const currentSet = new Set(payload.existingImageUrls);
          if (originalSet.size !== currentSet.size) {
            shouldUpdateImages = true;
          } else {
            for (const url of originalSet) {
              if (!currentSet.has(url)) {
                shouldUpdateImages = true;
                break;
              }
            }
          }
        }
      }

      formData.append("imageUpdate", shouldUpdateImages ? "true" : "false");

      const res: any = await axiosClient(endpoint, {
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200 || res.status === 201) {
        const responseProduct = res.data
          ? normalizeProductAdmin(res.data)
          : undefined;
        if (responseProduct) {
          applyProductUpdate(responseProduct, productModalMode, editingProduct);
        }

        setProductModalOpen(false);
        setEditingProduct(null);
      } else {
        setProductModalError(res?.message ?? "Operation failed");
      }
    } catch (error) {
      setProductModalError(extractErrorMessage(error, "Operation failed"));
    } finally {
      setProductModalSubmitting(false);
    }
  };

  const openCreateVariantModal = (product: IProductAdmin) => {
    ensureRowExpanded(product.product_id);
    setVariantModalMode("create");
    setVariantContext({ product });
    setVariantModalError("");
    setVariantModalOpen(true);
  };

  const openEditVariantModal = (product: IProductAdmin, variant: IVariant) => {
    ensureRowExpanded(product.product_id);
    setVariantModalMode("edit");
    setVariantContext({ product, variant });
    setVariantModalError("");
    setVariantModalOpen(true);
  };

  const handleVariantDeletePrompt = (product: IProductAdmin, variant: IVariant) => {
    ensureRowExpanded(product.product_id);
    setVariantToDelete({ product, variant });
  };

  const handleVariantSubmit = async (payload: VariantFormSubmit) => {
    if (!variantContext) return;
    setVariantModalSubmitting(true);
    setVariantModalError("");
    try {
      const { product, variant } = variantContext;
      let endpoint = `/admin/Product/${product.product_id}/variant`;
      let method: "post" | "put" = "post";

      if (variantModalMode === "edit" && variant) {
        endpoint = `/admin/Product/${product.product_id}/variant/${variant.variant_id}`;
        method = "put";
      }

      const res: any = await handleAPI(endpoint, payload, method);
      if (res.status === 200) {
        const responseProduct = res.data
          ? normalizeProductAdmin(res.data)
          : undefined;
        if (responseProduct) {
          applyProductUpdate(responseProduct, "edit", product);
        }
        setVariantModalOpen(false);
        setVariantContext(null);
      } else {
        setVariantModalError(res?.message ?? "Operation failed");
      }
    } catch (error) {
      setVariantModalError(extractErrorMessage(error, "Operation failed"));
    } finally {
      setVariantModalSubmitting(false);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await handleAPI(
        `/admin/Product/${productToDelete.product_id}`,
        null,
        "delete"
      );
      if (res.status === 200) {
        setProductToDelete(null);
        removeProductFromState(productToDelete.product_id);
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      setProductToDelete(null);
    }
  };

  const handleConfirmDeleteVariant = async () => {
    if (!variantToDelete) return;
    try {
      const res = await handleAPI(
        `/admin/Product/${variantToDelete.product.product_id}/variant/${variantToDelete.variant.variant_id}`,
        null,
        "delete"
      );
      if (res.status === 200) {
        const responseProduct = res.data
          ? normalizeProductAdmin(res.data)
          : undefined;
        if (responseProduct) {
          applyProductUpdate(responseProduct, "edit", variantToDelete.product);
        }
        setVariantToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete variant", error);
      setVariantToDelete(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-[#D9D9D940] p-2 shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
      <ProductToolbar
        categories={listCate}
        brands={brands}
        defaultValues={{
          q: DEFAULT_FILTER.name,
          categoryId: DEFAULT_FILTER.cate ? String(DEFAULT_FILTER.cate) : "",
          brandId: "",
          inStockOnly: DEFAULT_FILTER.isStock,
          sort: "newest",
        }}
        onFilterChange={handleFilterChange}
      />

      <ProductTable
        products={products}
        openIds={openIds}
        loading={loadingProducts}
        onToggle={toggleOpen}
        onCreateProduct={openCreateProductModal}
        onEditProduct={openEditProductModal}
        onDeleteProduct={(product) => setProductToDelete(product)}
        onAddVariant={openCreateVariantModal}
        onEditVariant={openEditVariantModal}
        onDeleteVariant={handleVariantDeletePrompt}
      />

      <div className="mb-1 flex h-10 items-center justify-center">
        <Pagination
          totalPage={Math.max(1, Math.ceil(totalItem / PAGE_SIZE))}
          page={isPage}
          totalProduct={totalItem}
          onChangePage={setIsPage}
        />
      </div>

      <ProductUpsertModal
        open={productModalOpen}
        mode={productModalMode}
        brands={brands}
        categories={listCate}
        product={editingProduct ?? undefined}
        submitting={productModalSubmitting}
        error={productModalError}
        onClose={() => {
          if (!productModalSubmitting) {
            setProductModalOpen(false);
            setEditingProduct(null);
          }
        }}
        onSubmit={handleProductSubmit}
      />

      <VariantUpsertModal
        open={variantModalOpen}
        mode={variantModalMode}
        variant={variantContext?.variant}
        productName={variantContext?.product.name}
        submitting={variantModalSubmitting}
        error={variantModalError}
        onClose={() => {
          if (!variantModalSubmitting) {
            setVariantModalOpen(false);
            setVariantContext(null);
          }
        }}
        onSubmit={handleVariantSubmit}
      />

      <ChooseModule
        text="Are you sure you want to delete this product?"
        styleYes="bg-[#ff000095] text-white"
        open={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onYes={handleConfirmDeleteProduct}
      />

      <ChooseModule
        text="Remove this variant from the product?"
        styleYes="bg-[#ff000095] text-white"
        open={!!variantToDelete}
        onClose={() => setVariantToDelete(null)}
        onYes={handleConfirmDeleteVariant}
      />
    </div>
  );
}
