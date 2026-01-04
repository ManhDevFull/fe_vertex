'use client'


import { Brands } from "@/components/templates/brands/brands";
import DealsDay from "@/components/templates/dealsDay/dealsDay";
import EBrand from "@/components/templates/electronicBrands/eBrand";
import { Features } from "@/components/templates/features/features";
import Frequently from "@/components/templates/frequently/frequenty";
import ShopByCategory from "@/components/templates/shopByCategory/ShopByCategory";
import { Slider } from "@/components/templates/slider/slider";
import HamsterWheel from "@/components/ui/HamsterWheel";
import Skeleton from "@/components/ui/Skeleton";
import { FrequentlyDTO, ProductUi } from "@/types/type";
import { restApiBase } from "@/utils/env";
import axios from "axios";
import { img } from "framer-motion/client";
import React, { useEffect, useState } from "react";

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};
export default function Home({ children, params }: RootLayoutProps) {
  const [newProduct, setNewProduct] = useState<ProductUi[]>([]);// sản phẩm có giảm giá mới nhất
  const [frequentlyProduct, setFrequentlyProduct] = useState<FrequentlyDTO | null>(null); // sản phẩm kèm theo
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        // gọi song song
        const [discountRes, frequentlyRes] = await Promise.all([
          axios.get(`${restApiBase}product/discount`),
          axios.get(`${restApiBase}product/frequently`)
        ]);

        console.log("sản phẩm có discount:", discountRes.data);
        console.log("frequently:", frequentlyRes.data);

        setNewProduct(discountRes.data);
        setFrequentlyProduct(frequentlyRes.data);

      } catch (error: any) {
        if (error.response) console.log("lỗi từ server");
        if (error.request) console.log("không nhận được phản hồi từ server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);
  return (
    <div className="w-full p-0">
      <Slider />
      <Features />
      <Brands />
      {isLoading ? (
        <>
          {/* HEADER DEALS DAY */}
          <div className="w-full flex justify-between sm:items-center gap-4">
            {/* title */}
            <Skeleton type="title" className="w-1/3 h-8" />

            {/* timer + view all */}
            <div className="flex items-center gap-3">
              {/* 3 ô timer fake */}
              <Skeleton type="title" className="w-20 h-8 rounded-md" />
              <Skeleton type="title" className="w-20 h-8 rounded-md" />
              <Skeleton type="title" className="w-20 h-8 rounded-md" />

              {/* view all */}
              <Skeleton type="title" className="w-24 h-8 rounded-md" />
            </div>
          </div>

          {/* LIST PRODUCT SKELETON */}
          <div className="w-full grid grid-cols-2 justify-items-center gap-2 sm:grid-cols-2 lg:grid-cols-4 pt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 shadow-sm w-[220px]"
              >
                <Skeleton type="img" className="w-full h-[200px] rounded-2xl" />
                <Skeleton type="title" className="w-3/4 mt-3 h-5" />
                <Skeleton type="text" lines={2} className="mt-3" />
                <Skeleton type="title" className="w-full h-[30px] mt-3" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <DealsDay products={newProduct} />
      )}

      <ShopByCategory />
      <EBrand />
      {frequentlyProduct && (
        <Frequently product={frequentlyProduct} />
      )}
    </div>
  );
}
