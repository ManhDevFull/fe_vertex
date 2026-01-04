'use client'
import { GrPrevious } from "react-icons/gr";
import { CiShare2 } from "react-icons/ci";
import { toast } from "sonner";
import Back from "./Back";
export default function BackNavigation() {
  return (
    <div className="w-full flex justify-between items-center px-10 md:px-15 py-2 xl:px-40 pt-4">
      <div className="flex gap-2 items-center">
        <Back />
        <p className="text-[20px] font-bold">Back</p>
      </div>
      <div
        className="items-center"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Copied successfully!");
          } catch (error) {
            toast.error("Failed to copy URL.");
            console.error("Failed to copy: ", error);
          }
        }}
      >
        <CiShare2 size={30} />
      </div>
    </div>
  );
}
