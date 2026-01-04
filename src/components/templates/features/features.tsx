import { BsBoxSeam } from "react-icons/bs";
import { PiCreditCardLight, PiHeadphonesLight } from "react-icons/pi";
import { TfiCup } from "react-icons/tfi";

export function Features() {
    return (
        <div className="w-full px-4 sm:px-16">
            <div className="border-[1px] lg:py-4 px-4 rounded-[2px] border-[#E4E7E9] flex flex-col lg:flex lg:flex-row lg:justify-around">
                <div className="flex items-center py-2 lg:justify-between gap-4">
                    <div className="text-center">
                        <BsBoxSeam size={30} />
                    </div>
                    <div>
                        <h5>FASTED DELIVERY</h5>
                        <p className="text-gray-500">Delivery in 24/H</p>
                    </div>
                </div>
                <div className="hidden lg:block h-auto lg:w-[1px] bg-[#E4E7E9]"></div>
                <div className="border-t-1 py-2 border-[#E4E7E9] lg:border-none flex lg:justify-between items-center gap-4">
                    <div className="text-center">
                        <TfiCup size={30} />
                    </div>
                    <div>
                        <h5>24 HOURS RETURN</h5>
                        <p className="text-gray-500">100% money-back guarantee</p>
                    </div>
                </div>
                <div className="hidden lg:block h-auto lg:w-[1px] bg-[#E4E7E9]"></div>
                <div className="border-t-1 py-2 border-[#E4E7E9] lg:border-none flex lg:justify-between items-center gap-4">
                    <div className="text-center">
                        <PiCreditCardLight size={30} />
                    </div>
                    <div>
                        <h5>SCURE PAYMENT</h5>
                        <p className="text-gray-500">Your money is safe</p>
                    </div>
                </div>
                <div className="hidden lg:block h-auto lg:w-[1px] bg-[#E4E7E9]"></div>
                <div className="border-t-1 border-[#E4E7E9] lg:border-none flex py-2 lg:justify-between items-center gap-4 ">
                    <div className="text-center">
                        <PiHeadphonesLight size={30} />
                    </div>
                    <div>
                        <h5>SUPPORT 24/7</h5>
                        <p className="text-gray-500">Live contact/message </p>
                    </div>
                </div>
            </div>
        </div>
    )
}