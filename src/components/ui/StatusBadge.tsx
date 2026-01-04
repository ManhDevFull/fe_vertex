type StatusBadgeProps = {
  status: string;
  className?: string;
};

const getStatusClasses = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("fail")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (normalized.includes("pending") || normalized.includes("process")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (normalized.includes("ship") || normalized.includes("deliver")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (normalized.includes("complete") || normalized.includes("success")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
        status
      )} ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}
