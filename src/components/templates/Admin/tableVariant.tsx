import { formatCurrency } from "@/utils/currency";
import { IVariant } from "@/types/type";
import { AiTwotoneDelete } from "react-icons/ai";
import { FiEdit3 } from "react-icons/fi";

export type VariantActionHandlers = {
  onEdit?: (variant: IVariant) => void;
  onDelete?: (variant: IVariant) => void;
};

const formatVariantDetails = (value: unknown): string[] => {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) =>
          typeof item === "object" && item !== null
            ? Object.entries(item)
                .map(([k, v]) => `${k}: ${String(v)}`)
                .join(", ")
            : String(item)
        )
        .filter(Boolean);
    }
    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed)
        .map(([k, v]) =>
          Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${String(v)}`
        )
        .filter(Boolean);
    }
    return [String(parsed)];
  } catch (error) {
    return [typeof value === "string" ? value : JSON.stringify(value)];
  }
};

export default function renderVariant(
  vr: IVariant,
  indexOneBased: number,
  level = 0,
  parentIndex?: string,
  actions?: VariantActionHandlers
) {
  const indexStr = parentIndex
    ? `${parentIndex}.${indexOneBased}`
    : `${indexOneBased}`;
  const variantDetails = formatVariantDetails(vr.valuevariant);
  const getBgForLevel = (level: number) => {
    const lightness = Math.max(98 - level * 6, 86);
    return `hsl(0 0% ${lightness}%)`;
  };
  return (
    <div className="w-full">
      <div
        className="grid grid-cols-22 items-center border-b hover:bg-[#ffffff] border-[#00000012] text-[#474747]"
        style={{ backgroundColor: getBgForLevel(level + 1) }}
      >
        <div className="col-span-1 flex items-center justify-center py-2">
          {indexStr}
        </div>
        <div className="col-span-9 flex items-center py-2 pl-1">
          <div className="flex flex-wrap gap-2">
            {variantDetails.length === 0 ? (
              <span className="rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500">
                No details
              </span>
            ) : (
              variantDetails.map((detail, idx) => (
                <span
                  key={`${indexStr}-${idx}`}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 shadow-sm"
                >
                  {detail}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-center py-2">
          {formatCurrency(vr.price)}
        </div>
        <div className="col-span-3 flex items-center justify-center py-2">
          {formatCurrency(vr.inputprice)}
        </div>
        <div className="col-span-2 flex items-center justify-center py-2">
          {vr.stock}
        </div>
        <div className="col-span-2 flex items-center justify-center py-2">
          {vr.sold ?? 0}
        </div>
        <div className="col-span-3 flex items-center justify-evenly gap-1 ">
          <button
            type="button"
            onClick={() => actions?.onEdit?.(vr)}
            className="flex items-center outline-none gap-1 rounded-md border border-transparent hover:drop-shadow-[0px_4px_4px_rgba(0,0,255,0.45)] text-sm text-blue-600 transition hover:text-blue-400"
          >
            <FiEdit3 />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => actions?.onDelete?.(vr)}
            className="flex items-center outline-none gap-1 rounded-md border border-transparent text-sm text-red-600 transition hover:drop-shadow-[0px_4px_4px_rgba(255,0,0,0.55)] hover:text-red-400"
          >
            <AiTwotoneDelete />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
