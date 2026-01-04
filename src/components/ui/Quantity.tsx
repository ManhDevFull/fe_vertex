import { useEffect, useState } from "react";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

type QuantityProps = {
  onchange: (quantity: number) => void;
};

export default function Quantity({ onchange }: QuantityProps) {
  const [value, setValue] = useState<number>(1);

  useEffect(() => {
    onchange(value);
  }, [value, onchange]);

  const increase = () => {
    setValue((prev) => prev + 1);
  };

  const decrease = () => {
    setValue((prev) => (prev <= 1 ? 1 : prev - 1));
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
      <button
        type="button"
        onClick={decrease}
        className="rounded-lg p-1 text-slate-600 transition hover:bg-slate-100"
        aria-label="Decrease quantity"
      >
        <FiMinus size={18} />
      </button>
      <span className="min-w-[32px] text-center text-sm font-semibold text-slate-700">
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        className="rounded-lg p-1 text-slate-600 transition hover:bg-slate-100"
        aria-label="Increase quantity"
      >
        <GoPlus size={18} />
      </button>
    </div>
  );
}
