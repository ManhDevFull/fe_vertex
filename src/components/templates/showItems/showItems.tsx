"use client";

import { useEffect, useState } from "react";
import { IoMdGrid } from "react-icons/io";
import { MdViewList } from "react-icons/md";

import Back from "@/components/ui/Back";

type ShowItemsProps = {
  type: boolean;
  total: number;
  query?: string;
  filterCount?: number;
  onSetType: (type: boolean) => void;
};

export default function ShowItems({
  type,
  total,
  query,
  filterCount,
  onSetType,
}: ShowItemsProps) {
  const [showing, setShowing] = useState(type ? "grid" : "list");
  const heading = query?.trim()
    ? `Search results for "${query}"`
    : "All products";

  useEffect(() => {
    setShowing(type ? "grid" : "list");
  }, [type]);

  return (
    <div className="w-full px-4 sm:px-16 pt-8 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Back />
          <div>
            <p className="text-sm text-slate-500">Browse catalog</p>
            <h1 className="text-2xl font-semibold text-[#1B4B66]">
              {heading}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-lg bg-slate-100 px-3 py-1">
                {total} items
              </span>
              {filterCount ? (
                <span className="rounded-lg bg-slate-100 px-3 py-1">
                  {filterCount} filters
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => {
                onSetType(true);
                setShowing("grid");
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                showing === "grid"
                  ? "bg-[#1B4B66] text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-pressed={showing === "grid"}
            >
              <IoMdGrid size={16} />
              Grid
            </button>
            <button
              type="button"
              onClick={() => {
                onSetType(false);
                setShowing("list");
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                showing === "list"
                  ? "bg-[#1B4B66] text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-pressed={showing === "list"}
            >
              <MdViewList size={16} />
              List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
