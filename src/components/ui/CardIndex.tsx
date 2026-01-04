import { PiShoppingCartSimpleLight } from "react-icons/pi";
import NewLabel from "./NewLabel";
import { FaPlus } from "react-icons/fa";

type productProps = {
    img: string;
    isNew: boolean;
}

export default function CardIndex({
    img,
    isNew }: productProps) {
    return (
        <div className="w-auto p-2 bg-[#FAFAFA] h-auto flex justify-center items-center rounded-3xl ">
            <div className=" bg-[#ECEDEF] rounded-3xl p-6 sm:p-14 lg:p-10 relative group overflow-hidden">
                <img className="w-[150px] h-[160px] sm:w-[150px] sm:h-[200px] md:w-[180px] md:h-[200px] lg:w-[200px] lg:h-[160px] xl:w-[300px] xl:h-[250px]" src={img} alt="" />
                {
                    isNew && <NewLabel className="absolute top-0 left-0" />
                }
                <div className="absolute inset-0 bg-[#00000094] flex justify-center items-center gap-6 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="h-12 w-12 flex justify-center items-center rounded-full bg-white cursor-pointer hover:scale-110 transition-transform">
                        <PiShoppingCartSimpleLight size={28} />
                    </div>
                    <div className="h-12 w-12 flex justify-center items-center rounded-full bg-white cursor-pointer hover:scale-110 transition-transform">
                        <FaPlus size={28} />
                    </div>
                </div>
            </div>
        </div>
    )
}