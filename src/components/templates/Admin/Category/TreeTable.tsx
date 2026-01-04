'use client';

import CategoryAction from '@/components/templates/Admin/CategoryAction';
import PlusMinusIcon from '@/components/ui/PlusMinusIcon';
import Collapse from '@/components/ui/collapse';
import HamsterWheel from '@/components/ui/HamsterWheel';
import type { CategoryTree } from '@/types/type';

type CategoryTreeTableProps = {
  categories: CategoryTree[];
  openIds: number[];
  loading: boolean;
  onToggle: (id: number) => void;
  onAddChild: (category: CategoryTree) => void;
  onEdit: (category: CategoryTree) => void;
  onDelete: (category: CategoryTree) => void;
};

const getBgForLevel = (level: number) => {
  const lightness = Math.max(98 - level * 6, 86);
  return `hsl(0 0% ${lightness}%)`;
};

export default function CategoryTreeTable({
  categories,
  openIds,
  loading,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryTreeTableProps) {
  const renderCategory = (cate: CategoryTree, indexOneBased: number, level = 0, parentIndex?: string) => {
    const indexStr = parentIndex ? `${parentIndex}.${indexOneBased}` : `${indexOneBased}`;
    const isOpen = openIds.includes(cate.id);
    const hasChildren = Array.isArray(cate.children) && cate.children.length > 0;

    return (
      <div key={`node-${cate.id}`} className="col-span-24">
        <div
          className="grid grid-cols-24 items-center border-t border-[#00000008] py-3 text-[#474747]"
          style={{ backgroundColor: getBgForLevel(level) }}
        >
          <div className="col-span-2 flex items-center justify-center py-2">{indexStr}</div>
          <div className="col-span-11 flex items-center gap-2 py-2 pl-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddChild(cate);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-base text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 md:hidden"
              aria-label="Add subcategory"
            >
              +
            </button>
            <div
              className="flex flex-1 cursor-pointer select-none items-center gap-2"
              onClick={() => {
                if (hasChildren) onToggle(cate.id);
              }}
            >
              {hasChildren && <PlusMinusIcon isOpen={isOpen} />}
              <span className="truncate">{cate.namecategory}</span>
            </div>
          </div>
          <div className="col-span-7 flex items-center justify-center py-2">{cate.product ?? 0}</div>
          <div className="col-span-4 flex items-center justify-center py-2">
            <CategoryAction onEdit={() => onEdit(cate)} onDelete={() => onDelete(cate)} onAddChild={() => onAddChild(cate)} />
          </div>
        </div>

        {hasChildren && (
          <Collapse isOpen={isOpen} duration={260}>
            <div className="col-span-24">
              {cate.children!.map((child, i) => renderCategory(child, i + 1, level + 1, indexStr))}
            </div>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-24 overflow-hidden rounded-b-md border-t border-gray-200 shadow">
      <div className="col-span-2 bg-[#00000007] py-2 text-center text-[#474747]">#</div>
      <div className="col-span-11 bg-[#00000007] py-2 pl-1 text-[#474747]">Category name</div>
      <div className="col-span-7 bg-[#00000007] py-2 text-center text-[#474747]">Number of products</div>
      <div className="col-span-4 bg-[#00000007] py-2 text-center text-[#474747]">Action</div>

      {loading && categories.length === 0 && (
        <div className="col-span-24 py-2 text-center text-sm text-gray-600">
          <HamsterWheel scale={0.5} />
        </div>
      )}
      {!loading && categories.length === 0 && (
        <div className="col-span-24 bg-[#ffffff70] py-3 text-center text-[#474747]">There are no categories.</div>
      )}
      {categories.length > 0 && categories.map((cate, i) => renderCategory(cate, i + 1))}
    </div>
  );
}
