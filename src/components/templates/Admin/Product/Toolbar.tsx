'use client';

import FilterBar, { type FilterParams, type BrandItem } from '@/components/templates/Admin/filterProduct';
import type { CategoryTree } from '@/types/type';

type ProductToolbarProps = {
  categories: CategoryTree[];
  brands: BrandItem[];
  defaultValues: FilterParams;
  onFilterChange: (params: FilterParams) => void;
};

export default function ProductToolbar({ categories, brands, defaultValues, onFilterChange }: ProductToolbarProps) {
  return (
    <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-[26px] font-medium text-[#2f2f2f]">Products</h1>
      <FilterBar categories={categories} brands={brands} defaultValues={defaultValues} onChange={onFilterChange} />
    </div>
  );
}
