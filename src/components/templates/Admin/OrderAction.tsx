"use client";

import { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaEye, FaTruck, FaCheckCircle, FaBan } from "react-icons/fa";

interface OrderActionProps {
  onView?: () => void;
  onShip?: () => void;
  onDeliver?: () => void;
  onCancel?: () => void;
  disabled?: {
    ship?: boolean;
    deliver?: boolean;
    cancel?: boolean;
  };
}

export default function OrderAction({
  onView,
  onShip,
  onDeliver,
  onCancel,
  disabled,
}: OrderActionProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 180 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setOpen((prev) => !prev);
  };

  const handleClick = (action?: () => void, isDisabled?: boolean) => {
    if (isDisabled) return;
    action?.();
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div ref={buttonRef}>
        <CiMenuKebab
          size={22}
          className="cursor-pointer text-[#3b3b3b] transition hover:text-black"
          onClick={toggleOpen}
        />
      </div>
      {open && (
        <div
          className={`absolute ${
            position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          } right-0 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50`}
        >
          <button
            onClick={() => handleClick(onView)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
          >
            <FaEye /> View details
          </button>
          <button
            onClick={() => handleClick(onShip, disabled?.ship)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
              disabled?.ship
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={disabled?.ship}
          >
            <FaTruck /> Mark as shipped
          </button>
          <button
            onClick={() => handleClick(onDeliver, disabled?.deliver)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
              disabled?.deliver
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={disabled?.deliver}
          >
            <FaCheckCircle /> Mark as delivered
          </button>
          <button
            onClick={() => handleClick(onCancel, disabled?.cancel)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
              disabled?.cancel
                ? "cursor-not-allowed text-gray-400"
                : "text-red-600 hover:bg-red-100"
            }`}
            disabled={disabled?.cancel}
          >
            <FaBan /> Cancel order
          </button>
        </div>
      )}
    </div>
  );
}
