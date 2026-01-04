"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import Description from "@/components/templates/Detail/Description";
import Information from "@/components/templates/Detail/Information";
import Media from "@/components/templates/Detail/media";
import HamsterWheel from "@/components/ui/HamsterWheel";
import type { IProductReview, ProductUi } from "@/types/type";
import { restApiBase } from "@/utils/env";
import BackNavigation from "@/components/ui/BackNavigation";

export default function Detail() {
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<ProductUi | null>(null);
  const [reviews, setReviews] = useState<IProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await axios(`${restApiBase}product/detail-product/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to load product details:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios(`${restApiBase}review/product/${id}?limit=10`);
        const payload = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];
        const normalized = payload.map((item: any) => ({
          id: item.id ?? item.Id ?? 0,
          rating: Number(item.rating ?? item.Rating ?? 0),
          content: item.content ?? item.Content ?? "",
          imageUrls: item.imageUrls ?? item.ImageUrls ?? [],
          createDate: item.createDate ?? item.CreateDate ?? null,
          customerName: item.customerName ?? item.CustomerName ?? "Anonymous",
          customerAvatar: item.customerAvatar ?? item.CustomerAvatar ?? null,
          variantAttributes:
            item.variantAttributes ?? item.VariantAttributes ?? {},
        }));
        setReviews(normalized);
      } catch (error) {
        console.error("Failed to load product reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <HamsterWheel />
      </div>
    );
  }

  return (
    <>
      <BackNavigation />
      <div className="px-4 pb-16 pt-8 md:px-16">
        {product ? (
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <Media product={product} />
              <Information product={product} />
            </div>
            <Description
              product={product}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow">
            Product not found.
          </div>
        )}
      </div>
    </>
  );
}
