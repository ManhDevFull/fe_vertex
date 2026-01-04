"use client";

import { Button } from "./button";
import React from "react";

type Props = {
  type?: string;
  totalPage: number; // tổng số trang (1-based)
  page: number; // trang hiện tại (1-based)
  totalProduct: number;
  onChangePage: (newPage: number) => void; // 1-based
  siblingCount?: number; // số trang hiển thị hai bên trang hiện tại (mặc định 1)
  label?: string;
};

const DOTS = "…";

function range(start: number, end: number) {
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, i) => i + start
  );
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | typeof DOTS)[] {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 dots
  if (totalNumbers >= totalPages) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages];
}

export default function Pagination({
  type,
  totalPage,
  page,
  totalProduct,
  onChangePage,
  siblingCount = 1,
  label = "products",
}: Props) {
  const limitedTotalPage =
    type === "news" || type === "best-seller"
      ? Math.min(totalPage, 5)
      : totalPage;
  const limitedTotalProducts =
    type === "news" || type === "best-seller"
      ? Math.min(totalProduct, 5 * 12)
      : totalProduct;

  const currentPage = Math.min(
    Math.max(1, page),
    Math.max(1, limitedTotalPage)
  );
  const pages = getPaginationRange(currentPage, limitedTotalPage, siblingCount);

  const go = (p: number) => {
    if (p < 1 || p > limitedTotalPage || p === currentPage) return;
    onChangePage(p);
  };

  if (limitedTotalPage <= 1) {
    return (
      <div className="flex justify-between">
        <div className="text-center text-xs text-gray-500 mt-3">
          Page {currentPage} / {limitedTotalPage} — Displaying{" "}
          {limitedTotalProducts} {label}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full px-3 items-center gap-3">
      <div className="text-center text-xs text-gray-500 mt-3">
        Page {currentPage} / {limitedTotalPage} — Displaying{" "}
        {limitedTotalProducts} {label}
      </div>

      <nav
        className="flex h-full items-center justify-center gap-2 mt-3"
        aria-label="Pagination"
      >
        {/* Prev */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &lt;
        </Button>

        {/* Pages with DOTS */}
        {pages.map((p, i) =>
          p === DOTS ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-sm text-gray-500 select-none"
            >
              {DOTS}
            </span>
          ) : (
            <Button
              key={`page-${p}`}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => go(p as number)}
              className={p === currentPage ? "bg-black text-white" : ""}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === limitedTotalPage}
          aria-label="Next page"
        >
          &gt;
        </Button>
      </nav>
    </div>
  );
}
