import { PiShoppingCartSimpleLight } from "react-icons/pi";
import NewLabel from "./NewLabel";
import { ProductUi, imgproductProps } from "@/types/type";
import { FaPlus } from "react-icons/fa";

export default function ImgProduct({
    img, type }: imgproductProps) {
    return (
        <div
            className={`relative bg-slate-100 flex justify-center items-center rounded-lg group overflow-hidden 
        ${type ? 'w-full h-[280px]' : 'w-[200px] h-[200px]'}`}
        >
            {/* Ảnh sản phẩm */}
            <img
                className="h-full w-full object-contain"
                src={img}
                alt=""
            />

            {/* Overlay đen + icon */}
            <div className="absolute inset-0 bg-[#00000094] flex justify-center items-center gap-6 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-12 w-12 flex justify-center items-center rounded-full bg-white cursor-pointer hover:scale-110 transition-transform">
                    <PiShoppingCartSimpleLight size={28} />
                </div>
                <div className="h-12 w-12 flex justify-center items-center rounded-full bg-white cursor-pointer hover:scale-110 transition-transform">
                    <FaPlus size={28} />
                </div>
            </div>
        </div>
    )
}