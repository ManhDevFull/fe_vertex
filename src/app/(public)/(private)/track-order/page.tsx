"use client";
import NavigationPath from "@/components/ui/NavigationPath";
import BackNavigation from "@/components/ui/BackNavigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function TrackOrder() {
  const router = useRouter()
  const products = [
    {
      id: 1,
      name: "Jacket",
      description: "Coat",
      price: 200,
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1755614948/4eda7f01-e154-4df5-a6bd-ca78c8d1db9c.png",
      Qty: 3,
      status: "Order Placed",
    },
    {
      id: 2,
      name: "Jacket",
      description: "Coat",
      price: 200,
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1755592188/93c1a905-070e-430b-825a-2d0fae8b9e6c.png",
      Qty: 3,
      status: "Packaging",
    },
    {
      id: 3,
      name: "Jacket",
      description: "Coat",
      price: 200,
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1755614948/4eda7f01-e154-4df5-a6bd-ca78c8d1db9c.png",
      Qty: 3,
      status: "On The Road",
    },
    {
      id: 4,
      name: "Jacket",
      description: "Coat",
      price: 200,
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1755614948/4eda7f01-e154-4df5-a6bd-ca78c8d1db9c.png",
      Qty: 3,
      status: "Delivered",
    },
  ];
  // const activities = [
  //   {
  //     icon: PiChecks,
  //     bg: "bg-green-200",
  //     border: "border-green-400",
  //     textColor: "text-green-600",
  //     content:
  //       "Your order has been delivered. Thank you for shopping at Colicon",
  //     time: "23 Jan, 2021 at 7:32 PM",
  //   },
  //   {
  //     icon: IoMdContact,
  //     bg: "bg-blue-300 ",
  //     border: "border-blue-300",
  //     textColor: "text-blue-600",
  //     content:
  //       "Our delivery man (John Wick) Has picked-up your order for delvery",
  //     time: "23 Jan, 2021 at 2:00 PM",
  //   },
  //   {
  //     icon: FaMapMarkerAlt,
  //     bg: "bg-blue-300 ",
  //     border: "border-blue-300",
  //     textColor: "text-blue-600",
  //     content:
  //       "Our delivery man (John Wick) Has picked-up your order for delvery",
  //     time: "23 Jan, 2021 at 2:00 PM",
  //   },
  //   {
  //     icon: FaMap,
  //     bg: "bg-blue-300 ",
  //     border: "border-blue-300",
  //     textColor: "text-blue-600",
  //     content:
  //       "Our delivery man (John Wick) Has picked-up your order for delvery",
  //     time: "23 Jan, 2021 at 2:00 PM",
  //   },
  //   {
  //     icon: CiCircleCheck,
  //     bg: "bg-green-200",
  //     border: "border-green-400",
  //     textColor: "text-green-600",
  //     content:
  //       "Your order has been delivered. Thank you for shopping at Colicon",
  //     time: "23 Jan, 2021 at 7:32 PM",
  //   },
  //   {
  //     icon: PiNotepadBold,
  //     bg: "bg-blue-300 ",
  //     border: "border-blue-300",
  //     textColor: "text-blue-600",
  //     content:
  //       "Our delivery man (John Wick) Has picked-up your order for delvery",
  //     time: "23 Jan, 2021 at 2:00 PM",
  //   },
  // ];

  const orderData = {
    status: "Packaging",
  };
  // const currentStep = steps.findIndex((s) => s.name === orderData.status);
  const [currentStep, setCurrentStep] = useState(Number);
  type TrackProduct = {
    id: number;
    status: string;
    name: string;
    img: string;
    description: string;
    price: number;
    Qty: number;
  };
  const [product, setProduct] = useState<TrackProduct | null>(null);
  return (
    <>
      <main className="w-full relative pt-2">
        <NavigationPath />
        <BackNavigation />
        <div className="w-full px-10 md:px-15 py-2 xl:px-40 ">
          <div className="w-full">
            <h1 className="font-bold text-xl sm:text-2xl">Track Order</h1>
            <p className="text-base sm:text-lg text-stone-600">
              To track your order please enter your order ID in the input field
              below and press the "Track Order" button. This was given to you on
              your receipt and in the confirmation email you should have
              received.
            </p>
          </div>
          <div className="block bg-gray-100 w-full rounded-[8px] mt-4 px-4 pb-2 overflow-x-auto">
            <div className="flex w-full border-b-1 border-[#888888] text-[#5b5b5b]">
              <p className="w-[52%] pl-2 text-left py-2">Product Name</p>
              <p className="w-[16%] text-center py-2">Price</p>
              <p className="w-[16%] text-center py-2">Qty</p>
              <p className="w-[16%] text-center py-2">Subtotal</p>
            </div>

            {products.map((product, index) => (
              <div
                key={index}
                className="flex mt-2 p-2 rounded-lg cursor-pointer hover:bg-[#dddddd]"
                onClick={() =>
                  router.push(`/track-order/${product.id}`)
                }
              >
                <div className="w-[52%] text-center">
                  <div className="flex gap-2">
                    <img className="w-18" src={product.img} alt="" />
                    <div>
                      <h5 className="font-medium">{product.name}</h5>
                      <p className="text-sm uppercase text-[#8c8c8c]">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-[16%] flex items-center px-4 justify-center">${product.price}</div>
                <div className="w-[16%] flex items-center px-4 justify-center">{product.Qty}</div>
                <div className="w-[16%] flex items-center px-4 justify-center">${product.Qty * product.price}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
