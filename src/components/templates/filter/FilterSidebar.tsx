"use client";

import { FiMinus } from "react-icons/fi";

import AccordionItem from "@/components/ui/AccordionItem";
import type { allvariant, valueFilter, variants } from "@/types/type";

type RangePrice = {
  min: string;
  max: string;
};

type FilterSidebarProps = {
  categories: string[];
  allVariant: allvariant[] | null;
  variantApi: variants[];
  selectedFilter: valueFilter;
  rangePrice: RangePrice;
  priceError: string;
  hasFilters: boolean;
  onToggleFilter: (key: string, value: string) => void;
  onRangeChange: (field: keyof RangePrice, value: string) => void;
  onApplyPrice: () => void;
  onClearFilters: () => void;
};

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean)));

const FilterOption = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-3 text-sm text-slate-600">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-slate-300 accent-[#1B4B66]"
    />
    <span className="font-medium text-slate-700">{label}</span>
  </label>
);

export default function FilterSidebar({
  categories,
  allVariant,
  variantApi,
  selectedFilter,
  rangePrice,
  priceError,
  hasFilters,
  onToggleFilter,
  onRangeChange,
  onApplyPrice,
  onClearFilters,
}: FilterSidebarProps) {
  const selectedCategory = selectedFilter.namecategory?.[0] ?? "";

  const defaultBrandOptions =
    allVariant?.find((item) => item.key === "brand")?.values ?? [];
  const brandOptions = selectedCategory
    ? uniqueValues(variantApi.flatMap((item) => item.brand ?? []))
    : uniqueValues(defaultBrandOptions);

  const variantGroups = selectedCategory
    ? Array.from(
        variantApi.reduce((acc, item) => {
          Object.entries(item.variant ?? {}).forEach(([key, values]) => {
            const existing = acc.get(key) ?? new Set<string>();
            uniqueValues(values).forEach((value) => existing.add(value));
            acc.set(key, existing);
          });
          return acc;
        }, new Map<string, Set<string>>())
      ).map(([key, values]) => ({
        key,
        values: Array.from(values),
      }))
    : [];

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-5 shadow xl:sticky xl:top-24">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1B4B66]">Filters</p>
          <p className="text-xs text-slate-400">Refine your search</p>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasFilters}
          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <div className="space-y-6">
        <AccordionItem title="Category">
          <div className="mt-3 space-y-3">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400">No categories found.</p>
            ) : (
              categories.map((item) => (
                <FilterOption
                  key={item}
                  label={toTitle(item)}
                  checked={
                    Array.isArray(selectedFilter.namecategory)
                      ? selectedFilter.namecategory.includes(item)
                      : false
                  }
                  onChange={() => onToggleFilter("namecategory", item)}
                />
              ))
            )}
          </div>
        </AccordionItem>

        <div>
          <p className="text-sm font-semibold text-slate-700">Price range</p>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={rangePrice.min}
              onChange={(event) => onRangeChange("min", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1B4B66] focus:outline-none"
              type="text"
              placeholder="Min"
            />
            <FiMinus className="text-slate-400" />
            <input
              value={rangePrice.max}
              onChange={(event) => onRangeChange("max", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1B4B66] focus:outline-none"
              type="text"
              placeholder="Max"
            />
          </div>
          {priceError && (
            <p className="mt-2 text-xs text-red-500">{priceError}</p>
          )}
          <button
            onClick={onApplyPrice}
            className="mt-3 w-full rounded-lg bg-[#1B4B66] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#163d52]"
            type="button"
          >
            Apply price
          </button>
        </div>

        {brandOptions.length > 0 && (
          <AccordionItem title="Brand">
            <div className="mt-3 space-y-3">
              {brandOptions.map((value) => (
                <FilterOption
                  key={value}
                  label={toTitle(value)}
                  checked={
                    Array.isArray(selectedFilter.brand)
                      ? selectedFilter.brand.includes(value)
                      : false
                  }
                  onChange={() => onToggleFilter("brand", value)}
                />
              ))}
            </div>
          </AccordionItem>
        )}

        {variantGroups.map((group) => (
          <AccordionItem key={group.key} title={toTitle(group.key)}>
            <div className="mt-3 space-y-3">
              {group.values.map((value) => (
                <FilterOption
                  key={value}
                  label={toTitle(value)}
                  checked={
                    Array.isArray(selectedFilter[group.key])
                      ? selectedFilter[group.key].includes(value)
                      : false
                  }
                  onChange={() => onToggleFilter(group.key, value)}
                />
              ))}
            </div>
          </AccordionItem>
        ))}
      </div>
    </div>
  );
}
