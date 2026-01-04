  "use client";
  import BackNavigation from "@/components/ui/BackNavigation";
  import NavigationPath from "@/components/ui/NavigationPath";
  import { BsFillBoxSeamFill } from "react-icons/bs";
  import { CiCircleCheck } from "react-icons/ci";
  import { FaHandshake, FaTruck } from "react-icons/fa";
  import { FaCheck } from "react-icons/fa6";
  import { FiMap } from "react-icons/fi";
  import { HiOutlineMapPin } from "react-icons/hi2";
  import {
    PiChecks,
    PiNotebook,
    PiNotepad,
    PiUser,
  } from "react-icons/pi";

  type Props = {
    params: { id: string };
  };
  export default function OrderProcess({ params }: Props) {
    console.log(params)
    const product = {
      id: 1,
      name: "Jacket",
      description: "Coat",
      price: 200,
      img: "https://res.cloudinary.com/do0im8hgv/image/upload/v1755614948/4eda7f01-e154-4df5-a6bd-ca78c8d1db9c.png",
      Qty: 3,
      status: "Packaging",
    };
    const steps = [
      { name: "Order Placed", icon: <PiNotebook size={30} color="#1877F2" /> },
      {
        name: "Packaging",
        icon: <BsFillBoxSeamFill size={30} color="#1877F2" />,
      },
      { name: "On The Road", icon: <FaTruck size={30} color="#1877F2" /> },
      { name: "Delivered", icon: <FaHandshake size={30} color="#1877F2" /> },
    ];
    const activities = [
      {
        icon: PiChecks,
        bg: "bg-[#EAF7E9]",
        border: "border-[#D5F0D3]",
        textColor: "text-[#2DB224]",
        content:
          "Your order has been delivered. Thank you for shopping at Colicon",
        time: "23 Jan, 2021 at 7:32 PM",
      },
      {
        icon: PiUser,
        bg: "bg-[#EAF6FE] ",
        border: "border-[#D5EDFD]",
        textColor: "text-[#2DA5F3]",
        content:
          "Our delivery man (John Wick) Has picked-up your order for delvery",
        time: "23 Jan, 2021 at 2:00 PM",
      },
      {
        icon: HiOutlineMapPin,
        bg: "bg-[#EAF6FE] ",
        border: "border-[#D5EDFD]",
        textColor: "text-[#2DA5F3]",
        content:
          "Our delivery man (John Wick) Has picked-up your order for delvery",
        time: "23 Jan, 2021 at 2:00 PM",
      },
      {
        icon: FiMap,
        bg: "bg-[#EAF6FE] ",
        border: "border-[#D5EDFD]",
        textColor: "text-[#2DA5F3]",
        content:
          "Our delivery man (John Wick) Has picked-up your order for delvery",
        time: "23 Jan, 2021 at 2:00 PM",
      },
      {
        icon: CiCircleCheck,
        bg: "bg-[#EAF7E9]",
        border: "border-[#D5F0D3]",
        textColor: "text-[#2DB224]",
        content:
          "Your order has been delivered. Thank you for shopping at Colicon",
        time: "23 Jan, 2021 at 7:32 PM",
      },
      {
        icon: PiNotepad,
        bg: "bg-[#EAF6FE] ",
        border: "border-[#D5EDFD]",
        textColor: "text-[#2DA5F3]",
        content:
          "Our delivery man (John Wick) Has picked-up your order for delvery",
        time: "23 Jan, 2021 at 2:00 PM",
      },
    ];
    const currentIndex = steps.findIndex((s) => s.name === product.status);
    const styleStep = {
      isCompleted: "bg-[#1877F2] border-[#1877F2]",
      isCurrent: "bg-[#1877F2] border-white",
      isUpcoming: "bg-white border-[#1877F2]",
    };
    return (
      <div>
        <NavigationPath />
        <BackNavigation />
        <div
          id="track-order"
          className="w-full px-10 md:px-15 py-2 xl:px-40 mt-4"
        >
          <div className="border-[1px] border-gray-100">
            <div className="p-4">
              <div className="bg-amber-100 flex items-center justify-between p-4">
                <div>
                  <p className="font-bold">#96459761</p>
                  <p className="text-xs sm:text-base text-zinc-600">
                    4 products Order Placed in 17 Jan, 2021 at 7:32px
                  </p>
                </div>
                <div>
                  <h2 className="!text-blue-600 !text-2xl sm:text-base">
                    Rs.1199.0
                  </h2>
                </div>
              </div>
            </div>
            <p className="text-zinc-600 !pl-6">
              Order expected arrival 23 Jan, 2021
            </p>

            <div className="p-2 w-full">
              <div className="w-[60%] hidden lg:block m-auto relative">
                <div className="w-full flex justify-center">
                  <div className="">
                    <div className=" bg-[#D4E7FF] w-[87%] h-2 absolute top-2 z-8"></div>
                  </div>
                  <div className="flex w-[89%] justify-between pb-18">
                    <div
                      className={`bg-[#1877F2] h-2 absolute top-2 z-9
                        ${product.status === steps[1].name && 'w-[29%]'} 
                        ${product.status === steps[2].name && 'w-[58%]'} 
                        ${product.status === steps[3].name && 'w-[87%]'} `}
                    />
                    {steps.map((step, index) => {
                      const isStyle =
                        index < currentIndex
                          ? "isCompleted"
                          : index === currentIndex
                          ? "isCurrent"
                          : "isUpcoming";

                      return (
                        <div key={index} className="flex flex-col items-center relative z-10">
                          {/* Circle */}
                          <div
                            className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#0026ff] border-2 
                  ${styleStep[isStyle]}
                `}
                          >
                            {isStyle === "isCompleted" && (
                              <FaCheck color="white" size={12} />
                            )}
                          </div>

                          <div
                            className={`mt-2 absolute  top-6 left-1/2 -translate-x-1/2 flex flex-col items-center`}
                          >
                            <div className={`mb-1`}>{step.icon}</div>
                            <p
                              className={`whitespace-nowrap ${
                                isStyle === "isUpcoming" && "text-[#868686]"
                              }`}
                            >
                              {step.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex justify-start border-[1px] !h-auto !border-gray-100">
            <div>
              <h2 className="text-gray-900">Order Activity</h2>
              <div className="">
                {activities.map((activity, key) => (
                  <div key={key} className="flex gap-2 items-center mt-2">
                    <div
                      className={`w-12 h-12 border-1 ${activity.border} ${activity.bg} rounded-[2px] flex justify-center items-center`}
                    >
                      <activity.icon
                        className={`${activity.textColor}`}
                        size={23}
                      />
                    </div>
                    <div>
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-stone-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
