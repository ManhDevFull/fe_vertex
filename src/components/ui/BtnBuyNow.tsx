import { FaRupeeSign } from "react-icons/fa"

type PriceProps = {
    price: number
}
export default function BtnBuyNow({ price }: PriceProps) {
    return (
        <div className="w-full hover:cursor-pointer rounded-xl py-2 sm:py-4 flex justify-center items-center bg-[#232321]">
            <p className="text-white">BUY NOW - </p>
            <p className="text-[#FFA52F] font-bold flex items-center"> <FaRupeeSign /> {`${price}`}</p>
        </div>
    )
}