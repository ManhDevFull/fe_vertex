"use client";
import { useState, useEffect, useRef } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaTrashAlt } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";

interface ProductActionProps {
  onAddVariant?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
export default function ProductAction({ onAddVariant, onEdit, onDelete }: ProductActionProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
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

  return (
    <div className="relative" ref={menuRef}>
      <div ref={buttonRef}>
        <CiMenuKebab
          size={25}
          className={`cursor-pointer hover:text-gray-900 hover:drop-shadow transition-all duration-300`}
          onClick={toggleMenu}
        />
      </div>
      {open && (
        <div
          className={`absolute ${position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"} right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
        >
          <button
            onClick={() => { onEdit?.(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            <FiEdit3 /> Edit product
          </button>
          <button
            onClick={() => { onAddVariant?.(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            <IoAdd /> Add variant
          </button>
          <button
            onClick={() => { onDelete?.(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-100"
          >
            <FaTrashAlt /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
