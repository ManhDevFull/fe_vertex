import { BtnViewAll } from "@/components/ui/BtnViewAll";
import { FrequentlyDTO, ProductUi } from "@/types/type";
import { restApiBase } from "@/utils/env";
import axios from "axios";
import { P } from "node_modules/framer-motion/dist/types.d-DsEeKk6G";
import { useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaRupeeSign, FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { IoEyeOutline } from "react-icons/io5";

export default function Frequently({product} : {product : FrequentlyDTO} ) {
    // const products = [
    //     {
    //         "name": "Xbox Series S - 512GB SSD Console with Wireless Controller - EU Version",
    //         "price_original": 865.99,
    //         "price_discounted": 442.12,
    //         "discount_percent": 32,
    //         "rating": 4.5,
    //         "reviews_count": 52677,
    //         "description": "Games built using the Xbox Series X|S development kit showcase unparalleled load times, visuals.",
    //         "status": "HOT",
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811327/c62f77a7-070e-4c1d-9dd4-e9c8e53fe214.png",
    //         "category": "Console"
    //     },
    //     {
    //         "name": "Bose Sport Earbuds - Wireless Earphones - Bluetooth In Ear",
    //         "price_original": 329,
    //         "price_discounted": 2300,
    //         "discount_percent": null,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": "Sold Out",
    //         "availability": "Out of Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811346/9d5dda5d-9f4c-4443-b697-77fe0a7ee5dd.png",
    //         "category": "Earphones"
    //     },
    //     {
    //         "name": "Simple Mobile 4G LTE Prepaid Smartphone",
    //         "price_original": 10,
    //         "price_discounted": null,
    //         "discount_percent": 300,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811769/90fdba37-80c0-4418-b026-4b0e626003d1.png",
    //         "category": "Smartphone"
    //     },
    //     {
    //         "name": "4K UHD LED Smart TV with Chromecast Built-in",
    //         "price_original": 865,
    //         "price_discounted": 150,
    //         "discount_percent": 19,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811449/d13b8969-3af4-4654-96d2-7019c94fe382.png",
    //         "category": "TV"
    //     },
    //     {
    //         "name": "Sony DSCHX8 High Zoom Point & Shoot Camera",
    //         "price_original": 300,
    //         "price_discounted": null,
    //         "discount_percent": 1200,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811669/82547b6a-ffc3-4c58-b907-6b8e94d82588.png",
    //         "category": "Camera"
    //     },
    //     {
    //         "name": "Dell Optilex 7000x7480 All-in-One Computer Monitor",
    //         "price_original": 200,
    //         "price_discounted": null,
    //         "discount_percent": 300,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811669/82547b6a-ffc3-4c58-b907-6b8e94d82588.png",
    //         "category": "Computer"
    //     },
    //     {
    //         "name": "Portable Wshing Machine, 11lbs capacity Model 18NMFAM",
    //         "price_original": 865.99,
    //         "price_discounted": null,
    //         "discount_percent": 80,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811435/ecb6d0dd-afab-4447-b9bd-2c3e968794ec.png",
    //         "category": "Home Appliance"
    //     },
    //     {
    //         "name": "2-Barrel Carburetor Carb 2100 Engine Increase Horsepower",
    //         "price_original": 289,
    //         "price_discounted": null,
    //         "discount_percent": null,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": "HOT",
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811422/f480156b-c5c6-4f11-be6e-2fccbe53c7ed.png",
    //         "category": "Automotive"
    //     },
    //     {
    //         "name": "JBL FLIP 4 - Waterproof Portable Bluetooth Speaker - Black",
    //         "price_original": 360,
    //         "price_discounted": 250,
    //         "discount_percent": 32,
    //         "rating": null,
    //         "reviews_count": null,
    //         "description": null,
    //         "status": null,
    //         "availability": "In Stock",
    //         "image_url": "https://res.cloudinary.com/do0im8hgv/image/upload/v1757811669/82547b6a-ffc3-4c58-b907-6b8e94d82588.png",
    //         "category": "Speaker"
    //     }
    // ]
    const [products, setProducts] = useState<FrequentlyDTO | null>(null);
    useEffect(() => {
        setProducts(product);
    }, []);
    // nhóm mainProduct và accompanyingProducts và 1 mảng
    const mergedProduct = [
        { ...product?.main, isMain: true },
        ...(product?.accompanying?.map(p => ({ ...p, isMain: false })) ?? [])
    ];
    console.log("mảng sau khi merge", mergedProduct);
    return (
        <div className="py-8 px-4 sm:px-16">
            <div className="pt-8 border-t-1 border-gray-300 flex justify-between items-center">
                <h2 className="sm:text-[18px] md:text-[24px] font-bold">FRENQUENTLY BOUGHT TOGETHER</h2>
                <BtnViewAll className="sm:px-6" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid lg:grid-cols-6 divide-x divide-y divide-[#E4E7E9] pt-16">
                {
                    mergedProduct.map((product, index) => (
                        <div
                            key={index}
                            className={`${product.isMain ? "row-span-2 col-span-2 " : "col-span-1 row-span-1"} p-4 group border-1 border-gray-200`}
                        >
                            {/* Discount */}
                            <div className="flex flex-col gap-2">
                                {/* {product.discount_percent && (
                                <div className="">
                                    <p className="text-black text-center font-bold p-2 bg-[#EFD33D] text-[12px] w-[100px] rounded">
                                        {`${product.discount_percent}% OFF`}
                                    </p>
                                </div>
                            )} */}
                                {/* Status */}
                                {/* {product.status && (
                                <div>
                                    <p className={`text-white text-[12px] text-center ${product.status === 'HOT' ? 'bg-[#EE5858] w-[50px]' : 'bg-[#929FA5] w-[100px]'}  p-2 rounded`}>{product.status}</p>
                                </div>
                            )} */}
                                <div>
                                    <p className={`text-white text-[12px] text-center   'bg-[#EE5858] w-[50px]' : 'bg-[#929FA5] w-[100px]'}  p-2 rounded`}>HOT</p>
                                </div>
                            </div>
                            {/* Image */}
                            <div className="relative py-2">
                                <div className="flex justify-around items-center absolute h-full w-full bg-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-800 z-0">
                                    <div className="md:w-[30px] md:h-[30px] lg:w-[35px] lg:h-[35px] xl:w-[40px] xl:h-[40px] flex justify-center items-center w-[50px] h-[50px] rounded-full z-10 bg-black">
                                        <CiHeart size={20} className="text-white" />
                                    </div>
                                    <div className="md:w-[30px] md:h-[30px] lg:w-[35px] lg:h-[35px] xl:w-[40px] xl:h-[40px] flex justify-center items-center w-[50px] h-[50px] rounded-full z-10 bg-black"></div>
                                    <div className="md:w-[30px] md:h-[30px] lg:w-[35px] lg:h-[35px] xl:w-[40px] xl:h-[40px] flex justify-center items-center w-[50px] h-[50px] rounded-full z-10 bg-black"></div>
                                </div>
                                <img className={`w-[400px] ${index == 0 ? 'h-[300px]' : 'h-[200px] md:h-[150px] lg:h-[160px] xl:h-[200px] z-10'}`} src={product.imgUrls?.[0] ?? ''} alt={product.name} />
                            </div>

                            {/* Rating */}
                            <div>
                                {product.rating && (
                                    <div className="flex pt-4">
                                        <div className="flex justify-around items-center gap-2">
                                            {Array.from({ length: product.rating }).map((_, i) => (
                                                <FaStar key={i} className="text-[#EBC80C]" size={20} />
                                            ))}
                                            <p className="text-[20px] text-gray-400">{`(${product.rating})`}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="py-4"><p className="font-medium text-[16px] line-clamp-2">{product.name}</p></div>
                                {/* <div className="flex items-center gap-2">
                                <span className={`font-bold flex items-center ${product.price_discounted ? 'line-through decoration-gray-500' : ''}`}>
                                    <FaRupeeSign size={14} className={`${product.price_discounted ? 'text-gray-500' : 'text-blue-500'}`} />
                                    <span className={`text-[14px] ${product.price_discounted ? 'text-gray-500 text-center' : 'text-blue-500'}`}>{product.price_original} </span>
                                </span>
                                {product.price_discounted && <p className="flex items-center font-bold"><FaRupeeSign size={14} className="text-blue-500" /> <span className="text-[14px] text-blue-500">{product.price_discounted} </span></p>}
                            </div> */}
                                {index == 0 && (<div>
                                    <p className="text-[15px] text-gray-500">
                                        {product.description}
                                    </p>
                                </div>)}
                            </div>
                            {product.isMain && (
                                <div className="flex justify-around items-center pt-3">
                                    <div><CiHeart size={40} /></div>
                                    <div className="flex items-center justify-evenly gap-2 rounded-[5px] bg-blue-500 px-2 py-2 sm:px-4 md:px-2 xl:px-4">
                                        <FiShoppingCart size={26} className="text-white" />
                                        <p className="text-white text-[14px] text-center">ADD TO CARD</p>
                                    </div>
                                    <div>
                                        <IoEyeOutline size={40} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    )
}