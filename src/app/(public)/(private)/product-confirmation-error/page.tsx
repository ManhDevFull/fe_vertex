'use client';
import BackNavigation from "@/components/ui/BackNavigation";
import NavigationPath from "@/components/ui/NavigationPath";
import { VscError } from "react-icons/vsc";
import { GoHome } from "react-icons/go";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function ProductConfirmation() {
    const router = useRouter();
    return (
        <main className="min-h-screen">
            <BackNavigation />
            <NavigationPath />

            {/* Title */}
            <div className="max-w-[1000px] mx-auto pt-6">
                <h1 className="font-bold text-5xl sm:text-6xl text-gray-900 mb-2">Product Confirmation</h1>
                <p className="text-2xl text-gray-400 font-normal">There was a problem confirming your order</p>
            </div>

            <div className="max-w-[1000px] mx-auto mt-10 flex flex-col md:flex-row items-center justify-center gap-30">
                <div className="flex-1 flex justify-center">
                    <img
                        src="https://res.cloudinary.com/do0im8hgv/image/upload/v1758725048/Untitled-1_uspr9d.png"
                        alt="Order Confirmed"
                        className="w-[700px] h-[400px] object-contain"
                    />
                </div>
                <div className="w-[500px] flex flex-col items-center">
                    <VscError className="text-red-500 text-6xl mb-4" />
                    <h2 className="font-bold text-2xl sm:text-3xl mb-2 text-center">
                        404, Page not founds
                    </h2>
                    <p className="text-gray-500 text-base mb-6 text-center">
                        Something went wrong. It's look that your requested could not be found. It's look like the link is broken or the page is removed.
                    </p>
                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                        >
                            <IoMdArrowRoundBack className="text-xl"/>
                            GO BACK
                        </button>
                        <button
                            onClick={() => router.push("/")}
                            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                        >
                            GO TO HOME <GoHome className="text-xl"/>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
