import { Apple, ArrowRight, GooglePlay } from "iconsax-react";
import Link from "next/link";
export default function FooterComponent() {
  const topCategory = [
    {
      key: "computerLaptop",
      name: "Computer & Laptop",
      href: "/computer",
    },
    {
      key: "smartPhone",
      name: "SmartPhone",
      href: "/smartphone",
    },
    {
      key: "headphone",
      name: "HeadPhone",
      href: "/headphone",
    },
    {
      key: "accessories",
      name: "Accessories",
      href: "/accessories",
    },
    {
      key: "cameraPhoto",
      name: "Camera & Photo",
      href: "/camera",
    },
    {
      key: "tvHomes",
      name: "TV & Homes",
      href: "/tv",
    },
  ];
  const quickLink = [
    {
      key: "shopProduct",
      name: "Shop Product",
      href: "/product",
    },
    {
      key: "shopingCart",
      name: "Shoping Cart",
      href: "/cart",
    },
    {
      key: "Wishlist",
      name: "Wishlist",
      href: "/wish-list",
    },
    {
      key: "compare",
      name: "Compare",
      href: "/compare",
    },
    {
      key: "trackOrder",
      name: "Track Order",
      href: ",order",
    },
    {
      key: "customerHelp",
      name: "Customer Help",
      href: "/help",
    },
    {
      key: "aboutUs",
      name: "About Us",
      href: "/About-Us",
    },
  ];
  const listTag = [
    {
      key: "game",
      name: "Game",
      href: "/game",
    },
    {
      key: "iPhone",
      name: "iPhone",
      href: "/iPhone",
    },
    {
      key: "tv",
      name: "TV",
      href: "/tv",
    },
    {
      key: "asusLaptops",
      name: "Asus Laptops",
      href: "/asus-laptop",
    },
    {
      key: "macbook",
      name: "Macbook",
      href: "/macbook",
    },
    {
      key: "ssd",
      name: "SSD",
      href: "/ssd",
    },
    {
      key: "graphicsCard",
      name: "Graphics Card",
      href: "/graphics-card",
    },
    {
      key: "powerBank",
      name: "Power Bank",
      href: "/power-bank",
    },
    {
      key: "smartTV",
      name: "Smart TV",
      href: "/smart-tv",
    },
    {
      key: "speaker",
      name: "Speaker",
      href: "/speaker",
    },
    {
      key: "tablet",
      name: "Tablet",
      href: "/tablet",
    },
    {
      key: "microwave",
      name: "Microwave",
      href: "/microwave",
    },
    {
      key: "samsung",
      name: "Samsung",
      href: "/samsung",
    },
  ];
  return (
    <footer className="mt-4 w-full grid 2xl:grid-cols-5 px-10 pt-10 xl:px-60 lg:grid-cols-3 sm:px-20 sm:py-10 sm:grid-cols-2 lg:px-30 2xl:px-60 lg:py-10 bg-gray-900 text-white ">
      <div>
        <h2 className="flex items-center">
          <svg
            className="scale-125"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0C27.9411 0 36 8.05887 36 18ZM27 18C27 22.9706 22.9706 27 18 27C13.0294 27 9 22.9706 9 18C9 13.0294 13.0294 9 18 9C22.9706 9 27 13.0294 27 18ZM18 24C21.3137 24 24 21.3137 24 18C24 14.6863 21.3137 12 18 12C14.6863 12 12 14.6863 12 18C12 21.3137 14.6863 24 18 24Z"
              fill="#FA8232"
            />
          </svg>
          <p className="font-extrabold text-3xl ml-2">UNITED DEAL</p>
        </h2>
      </div>
      <div>
        <h6 className="font-medium">TOP CATEGORY</h6>
        <ul>
          {topCategory.map((item) => (
            <li
              key={item.key}
              className="relative pt-2 overflow-hidden text-[#888888] duration-500 group"
            >
              <Link
                href={item.href}
                className="w-full flex items-center duration-500"
              >
                <span className="absolute -left-5 group-hover:left-[1px] h-[2px] w-4 group-hover:bg-yellow-400 opacity-0 transition-all duration-500 group-hover:opacity-100 " />
                <span className="group-hover:pl-5 group-hover:text-white duration-500">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
          <li className="text-[#F59E0B] hover:text-[#dda950] hover:underline hover:decoration-[#F59E0B] pt-2 duration-500">
            <Link className="flex items-center" href={""}>
              <p className="mr-1">Browse All Product </p>
              <ArrowRight size={20} color="#F59E0B" />
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-8 lg:mt-0">
        <h6 className="font-medium">QUICK LINK</h6>

        <ul style={{ margin: "0 !important", padding: "0 !important" }}>
          {quickLink.map((item) => (
            <li
              key={item.key}
              className="pt-2 text-[#888888] w-[70%] hover:text-[#ffffff] duration-500"
            >
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 2xl:mt-0">
        <h6 className="font-medium">DOWNLOAD APP</h6>
        <ul className="mt-3 flex sm:inline">
          <li
            className="h-14 pl-2 w-40 bg-gray-800 flex items-center justify-center rounded-sm hover:bg-[#ffffff2a] duration-300"
          >
            <Link href={""} className="w-full h-full flex items-center">
              <GooglePlay size={35} color="white" />
              <div className="ml-1">
                <p className="text-xs">Get it now</p>
                <h6 className="text-white">Google Play</h6>
              </div>
            </Link>
          </li>
          <li
            className="ml-2 sm:ml-0 sm:mt-3 pl-2 h-14 w-40 bg-gray-800 flex items-center justify-center rounded-sm hover:bg-[#ffffff2a] duration-300"
  
          >
            <Link href={""} className="w-full h-full flex items-center">
              <Apple size={35} color="white" />
              <div className="ml-1">
                <p className="text-xs">Get it now</p>
                <h6 className="text-white">App Store</h6>
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-8 2xl:mt-0">
        <h6 className="font-medium">POPULAR TAG</h6>
        <ul
          style={{ paddingLeft: "0 !important" }}
          className="w-full flex flex-wrap "
        >
          {listTag.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="py-1 px-2 mt-1 w-auto hover:bg-gray-700 text-[#888888] hover:text-white border-1 border-[#888888] hover:border-white mr-1 duration-400"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </div>
    </footer>
  );
}
