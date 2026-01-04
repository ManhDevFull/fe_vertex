import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import type { ProductUi } from "@/types/type";

export default function Media({ product }: { product: ProductUi }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const images = product.imgUrls ?? [];
  const hasImages = images.length > 0;
  const safeImages = hasImages ? images : [""];

  return (
    <div className="w-full max-w-[520px] space-y-4">
      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow">
        <Swiper
          spaceBetween={12}
          navigation
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          modules={[Thumbs, Navigation]}
          className="w-full"
        >
          {safeImages.map((img, index) => (
            <SwiperSlide key={`${img}-${index}`}>
              <div className="flex items-center justify-center rounded-lg bg-slate-50">
                {img ? (
                  <img
                    src={img}
                    alt={product.name}
                    className="h-[280px] w-full object-contain sm:h-[360px]"
                  />
                ) : (
                  <div className="flex h-[280px] w-full items-center justify-center text-sm text-slate-400 sm:h-[360px]">
                    No image available
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {images.length > 1 && (
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow">
          <Swiper
            onSwiper={setThumbsSwiper}
            direction="horizontal"
            slidesPerView={4}
            spaceBetween={12}
            watchSlidesProgress
            modules={[Thumbs]}
            className="w-full"
          >
            {images.map((img) => (
              <SwiperSlide key={img}>
                <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 transition hover:border-slate-300">
                  <img
                    src={img}
                    alt={product.name}
                    className="h-[72px] w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
