"use client";

import { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface ReviewActionProps {
  isUpdated?: boolean;
  onView?: () => void;
  onMarkUpdated?: () => void;
  onMarkPending?: () => void;
}

export default function ReviewAction({
  isUpdated,
  onView,
  onMarkUpdated,
  onMarkPending,
}: ReviewActionProps) {
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
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
    setOpen((prev) => !prev);
  };

  const handleAction = (cb?: () => void) => {
    cb?.();
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
          } right-0 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-50`}
        >
          <button
            onClick={() => handleAction(onView)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
          >
            <FaEye /> View detail
          </button>
          <button
            onClick={() => handleAction(onMarkUpdated)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
              isUpdated
                ? "text-gray-400 cursor-not-allowed"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
            disabled={isUpdated}
          >
            <FaToggleOn /> Mark updated
          </button>
          <button
            onClick={() => handleAction(onMarkPending)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
              !isUpdated
                ? "text-gray-400 cursor-not-allowed"
                : "text-amber-600 hover:bg-amber-50"
            }`}
            disabled={!isUpdated}
          >
            <FaToggleOff /> Mark pending
          </button>
        </div>
      )}
    </div>
  );
}
