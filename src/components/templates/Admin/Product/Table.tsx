'use client';

import ProductAction from '@/components/templates/Admin/ProductAction';
import renderVariant from '@/components/templates/Admin/tableVariant';
import LoaderText from '@/components/ui/LoadingText';
import PlusMinusIcon from '@/components/ui/PlusMinusIcon';
import Expando from '@/components/ui/ResizeObserver';
import type { IProductAdmin, IVariant } from '@/types/type';

type ProductTableProps = {
  products: IProductAdmin[];
  openIds: number[];
  loading: boolean;
  onToggle: (productId: number) => void;
  onCreateProduct: () => void;
  onEditProduct: (product: IProductAdmin) => void;
  onDeleteProduct: (product: IProductAdmin) => void;
  onAddVariant: (product: IProductAdmin) => void;
  onEditVariant: (product: IProductAdmin, variant: IVariant) => void;
  onDeleteVariant: (product: IProductAdmin, variant: IVariant) => void;
};

const getBgForLevel = (level: number) => {
  const lightness = Math.max(98 - level * 6, 86);
  return `hsl(0 0% ${lightness}%)`;
};

const renderImages = (urls: string[] | undefined) => {
  if (!urls || urls.length === 0) {
    return <span className="text-xs text-gray-500 md:text-sm">No images</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {urls.map((url, idx) => (
        <div
          key={`${url}-${idx}`}
          className="rounded-md border border-gray-200 bg-white shadow-sm"
          title={url}
        >
          <img
            src={url}
            alt={`Product image ${idx + 1}`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default function ProductTable({
  products,
  openIds,
  loading,
  onToggle,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: ProductTableProps) {
  return (
    <div className="grid grid-cols-24 overflow-hidden rounded-b-md border-t border-gray-200 shadow">
      <div className="col-span-1 bg-[#00000007] py-2 text-center text-[#474747]">#</div>
      <div className="col-span-7 bg-[#00000007] py-2 pl-1 text-[#474747]">Product name</div>
      <div className="col-span-2 bg-[#00000007] py-2 text-center text-[#474747]">Brand</div>
      <div className="col-span-3 bg-[#00000007] py-2 text-center text-[#474747]">Category</div>
      <div className="col-span-2 bg-[#00000007] py-2 text-center text-[#474747]">Stock</div>
      <div className="col-span-7 bg-[#00000007] py-2 text-[#474747]">Images</div>
      <div className="col-span-2 bg-[#00000007] py-2 pr-1 text-center text-[#474747]">
        <div className="flex items-center justify-center gap-2">
          <span>Action</span>
          <button
            type="button"
            onClick={onCreateProduct}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-base text-blue-600 transition hover:border-blue-300 hover:bg-blue-100"
            title="Create product"
          >
            <span aria-hidden="true">+</span>
            <span className="sr-only">Create product</span>
          </button>
        </div>
      </div>

      <div className="col-span-24 flex-grow overflow-y-auto bg-[#ffffff80] scrollbar-hidden" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {loading ? (
          <div className="flex min-h-[60px] items-center justify-center bg-[#ffffff70]">
            <LoaderText />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#ffffff70] py-3 text-center text-[#474747]">There are no products.</div>
        ) : (
          products.map((prd, index) => {
            const level = 0;
            const indexStr = String(index + 1);
            const isOpen = openIds.includes(prd.product_id);
            const totalStock = prd.variants?.reduce((acc, v) => acc + (v.stock ?? 0), 0) ?? 0;
            const hasVariants = Array.isArray(prd.variants) && prd.variants.length > 0;

            return (
              <div key={`product-${prd.product_id}`} className="w-full">
                <div
                  className="grid grid-cols-24 items-center border-t border-[#00000008] py-3 text-[#474747]"
                  style={{ backgroundColor: getBgForLevel(level) }}
                >
                  <div className="col-span-1 flex items-center justify-center py-2 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="col-span-7 flex items-center gap-2 py-2 pl-1">
                    {hasVariants ? (
                      <button
                        type="button"
                        onClick={() => onToggle(prd.product_id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-base text-blue-600 transition"
                        aria-label={isOpen ? 'Collapse variants' : 'Expand variants'}
                      >
                        <PlusMinusIcon isOpen={isOpen} />
                      </button>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-base text-gray-300">
                        <PlusMinusIcon isOpen={false} />
                      </span>
                    )}
                    <span className="truncate">{prd.name}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center py-2 text-sm">{prd.brand || '-'}</div>
                  <div className="col-span-3 flex items-center justify-center py-2 text-sm">{prd.category_name || '-'}</div>
                  <div className="col-span-2 flex items-center justify-center py-2 text-sm font-semibold">{totalStock}</div>
                  <div className="col-span-7 flex items-center overflow-hidden py-2">{renderImages(prd.imageurls)}</div>
                  <div className="col-span-2 flex items-center justify-center py-2">
                    <ProductAction
                      onEdit={() => onEditProduct(prd)}
                      onAddVariant={() => onAddVariant(prd)}
                      onDelete={() => onDeleteProduct(prd)}
                    />
                  </div>
                </div>

                {hasVariants && (
                  <Expando open={isOpen} duration={260}>
                    <div className="border-t border-gray-200 bg-[#fafafa] pl-2">
                      <div
                        className="grid grid-cols-22 items-center border-t border-[#00000008] text-[#474747]"
                        style={{ backgroundColor: getBgForLevel(1) }}
                      >
                        <div className="col-span-1 flex items-center justify-center py-2">#</div>
                        <div className="col-span-9 flex items-center py-2 pl-1">Variant Details</div>
                        <div className="col-span-2 flex items-center justify-center py-2">Price</div>
                        <div className="col-span-3 flex items-center justify-center py-2">Input Price</div>
                        <div className="col-span-2 flex items-center justify-center py-2">Stock</div>
                        <div className="col-span-2 flex items-center justify-center py-2">Sold</div>
                        <div className="col-span-3 flex items-center justify-center py-2">Action</div>
                      </div>
                      {prd.variants!.map((variant, j) => (
                        <div key={variant.variant_id} className="block">
                          {renderVariant(variant, j + 1, level + 1, indexStr, {
                            onEdit: (selected) => onEditVariant(prd, selected),
                            onDelete: (selected) => onDeleteVariant(prd, selected),
                          })}
                        </div>
                      ))}
                    </div>
                  </Expando>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
