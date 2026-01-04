import AutoSlide from "@/components/ui/AutoSlide";
import { BtnViewAll } from "@/components/ui/BtnViewAll";

export default function EBrand() {
    return (
        <div className="pt-8 px-4 sm:px-16">
            <div className=" pt-8 border-t-1 border-gray-300 flex justify-between items-center">
                <div className="flex gap-1">
                    <p className="font-bold sm:text-[18px] md:text-[24px] text-black">TOP</p>
                    <p className=" font-bold sm:text-[18px] md:text-[24px]">ELECTRONICS BRANDS</p>
                </div>
                <BtnViewAll className="sm:px-6" />
            </div>
            <AutoSlide />
        </div>
    )
}