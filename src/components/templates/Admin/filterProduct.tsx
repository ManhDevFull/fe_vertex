"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CategoryTree } from "@/types/type";

export type BrandItem = {
  id: string | number;
  name: string;
};

export type FilterParams = {
  q: string;
  categoryId: string; // '' = All
  brandId: string;    // '' = All
  inStockOnly: boolean;
  sort: "newest" | "priceAsc" | "priceDesc";
};

/* -------------------- utils -------------------- */
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

type Option = { value: string; label: string; disabled?: boolean };

/** Flatten cây category thành options, thụt đầu dòng theo level */
function flattenCategories(tree: CategoryTree[], level = 0, out: Option[] = [], disableParent = false) {
  const pad = "- ".repeat(level);
  for (const n of tree) {
    const hasChildren = !!n.children?.length;
    out.push({
      value: String(n.id),
      label: `${pad}${n.namecategory}`,
      disabled: disableParent && hasChildren, // nếu muốn không cho chọn node cha
    });
    if (hasChildren) flattenCategories(n.children!, level + 1, out, disableParent);
  }
  return out;
}

/* -------------------- component -------------------- */
export default function FilterBar({
  categories = [],          // dạng cây
  brands = [],              // [{id, name}]
  defaultValues,
  onChange,
  disableParentCategory = false, // tuỳ chọn: không cho chọn node cha
}: {
  categories: CategoryTree[];
  brands: BrandItem[];
  defaultValues?: Partial<FilterParams>;
  onChange: (f: FilterParams) => void;
  disableParentCategory?: boolean;
}) {
  const [q, setQ] = React.useState(defaultValues?.q ?? "");
  const [categoryId, setCategoryId] = React.useState(defaultValues?.categoryId ?? "");
  const [brandId, setBrandId] = React.useState(defaultValues?.brandId ?? "");
  const [inStockOnly, setInStockOnly] = React.useState(defaultValues?.inStockOnly ?? false);
  const [sort, setSort] = React.useState<FilterParams["sort"]>(defaultValues?.sort ?? "newest");

  // Nếu defaultValues có thể thay đổi từ parent → sync lại
  React.useEffect(() => {
    if (!defaultValues) return;
    setQ(defaultValues.q ?? "");
    setCategoryId(defaultValues.categoryId ?? "");
    setBrandId(defaultValues.brandId ?? "");
    setInStockOnly(defaultValues.inStockOnly ?? false);
    setSort((defaultValues.sort as FilterParams["sort"]) ?? "newest");
  }, [
    defaultValues?.q,
    defaultValues?.categoryId,
    defaultValues?.brandId,
    defaultValues?.inStockOnly,
    defaultValues?.sort,
  ]);

  // Debounce trường tìm kiếm
  const dq = useDebounced(q, 400);

  const hasInitialBrands = React.useRef(false);
  React.useEffect(() => {
    if (hasInitialBrands.current) {
      setBrandId("");
      return;
    }
    hasInitialBrands.current = true;
  }, [brands]);

  React.useEffect(() => {
    if (!brandId) return;
    const exists = brands.some((b) => String(b.id) === brandId);
    if (!exists) setBrandId("");
  }, [brands, brandId]);

  // Bắn filter lên parent
  React.useEffect(() => {
    onChange({ q: dq, categoryId, brandId, inStockOnly, sort });
  }, [dq, categoryId, brandId, inStockOnly, sort, onChange]);

  const clearAll = () => {
    const cleared: FilterParams = {
      q: "",
      categoryId: "",
      brandId: "",
      inStockOnly: false,
      sort: "newest",
    };
    setQ(cleared.q);
    setCategoryId(cleared.categoryId);
    setBrandId(cleared.brandId);
    setInStockOnly(cleared.inStockOnly);
    setSort(cleared.sort);
    onChange(cleared);
  };

  const cateOptions = React.useMemo(
    () => [{ value: "", label: "--- All ---" }, ...flattenCategories(categories, 0, [], disableParentCategory)],
    [categories, disableParentCategory]
  );

  const brandOptions = React.useMemo(
    () => [{ value: "", label: "--- All ---" }, ...brands.map(b => ({ value: String(b.id), label: b.name }))],
    [brands]
  );

  return (
    <div id="filter" className="flex flex-col gap-2 md:flex-row md:items-end pb-2">
      {/* Search */}
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Product name"
          className="w-full bg-white h-8 rounded-md px-3 shadow outline-none"
        />
      </div>

      {/* Category */}
      <div className="min-w-48">
        <label className="block text-xs text-gray-500 mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full h-8 rounded-md shadow px-2 bg-white outline-none"
        >
          {cateOptions.map(o => (
            <option key={o.value || "all"} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div className="min-w-40">
        <label className="block text-xs text-gray-500 mb-1">Brand</label>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full h-8 rounded-md shadow px-2 bg-white outline-none"
        >
          {brandOptions.map(o => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* In stock */}
      <div className="flex items-center gap-2 h-8">
        <input
          id="inStock"
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="size-4 outline-none"
        />
        <label htmlFor="inStock" className="text-sm">In Stock</label>
      </div>

      {/* Sort */}
      <div className="min-w-24">
        <label className="block text-xs text-gray-500 mb-1">Sort</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as FilterParams["sort"])}
          className="w-full h-8 rounded-md shadow px-2 bg-white outline-none"
        >
          <option value="newest">Newest</option>
          <option value="priceAsc">Price ↑</option>
          <option value="priceDesc">Price ↓</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear
        </Button>
      </div>
    </div>
  );
}
