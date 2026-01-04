"use client";
import { useState } from "react";

interface Props {
  isOpen: boolean;
}

export default function PlusMinusIcon({ isOpen }: Props) {
  return (
    <span className="relative w-3 h-3 inline-block mr-2">
      {/* Thanh ngang */}
      <span
        className={`absolute top-1/2 left-0 w-full h-[2px] bg-black transition-transform duration-300 -translate-y-1/2 $`}
      />
      {/* Thanh dọc */}
      <span
        className={`absolute left-1/2 top-0 w-[2px] h-full bg-black transition-all duration-300 -translate-x-1/2 ${
         isOpen ? "rotate-90" : "rotate-0"
        }`}
      />
    </span>
  );
}
