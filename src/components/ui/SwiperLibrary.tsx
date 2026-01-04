import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
type Swiperprops<P> = {
    items: P[];
    quantity: {
        smQuantity: number,
        lgQuantity: number
    };
    
    renderItem: (item:P, index: number) => React.ReactNode;
}
export default function SwiperLibrary<T>({items,quantity, renderItem} : Swiperprops<T>):React.ReactNode {
    return(
        <div className="w-full flex justify-center items-center mt-8">
            {/* dùng thư viện swiper */}
            <Swiper
                spaceBetween={10}
                slidesPerView={3} // mobile: 3 item
                breakpoints={{
                    640: { slidesPerView: quantity.smQuantity
                     },
                    1024: { slidesPerView: quantity.lgQuantity
                     }
                }}
            >
                {items.map((product, index) => (
                    <SwiperSlide className="!flex !justify-center !items-center" key={index}>
                        {renderItem(product, index)}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}