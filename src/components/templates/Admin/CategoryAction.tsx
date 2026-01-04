"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AiTwotoneDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { IoIosAddCircleOutline } from "react-icons/io";

export type CategoryActionProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
};

export default function CategoryAction({ onEdit, onDelete, onAddChild }: CategoryActionProps) {
  return (
    <TooltipProvider>
      <div className="flex h-full items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onEdit}
              disabled={!onEdit}
              className="flex items-center justify-center text-gray-600 transition hover:text-blue-500 hover:drop-shadow-[0px_4px_4px_rgba(0,0,255,0.35)] disabled:opacity-40"
              aria-label="Edit category"
            >
              <CiEdit size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onDelete}
              disabled={!onDelete}
              className="flex items-center justify-center text-gray-600 transition hover:text-red-500 hover:drop-shadow-[0px_4px_4px_rgba(255,0,0,0.35)] disabled:opacity-40"
              aria-label="Delete category"
            >
              <AiTwotoneDelete size={21} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Delete</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onAddChild}
              disabled={!onAddChild}
              className="flex items-center justify-center text-gray-600 transition hover:text-green-500 hover:drop-shadow-[0px_4px_4px_rgba(0,255,0,0.35)] disabled:opacity-40"
              aria-label="Add subcategory"
            >
              <IoIosAddCircleOutline size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Add subcategory</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
