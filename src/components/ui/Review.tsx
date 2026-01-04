import { div } from "framer-motion/client";
import { FaStar } from "react-icons/fa";
import { ProductUi } from "../../types/type";
type ReviewProps = {
    ratingReviews: number;
    totalReviews: number;
}
export function Review({ ratingReviews, totalReviews }: ReviewProps) {
    // Tránh chia cho 0
    const averageRating = totalReviews > 0 ? ratingReviews / totalReviews : 0;

    // Làm tròn đến 1 chữ số thập phân
    const roundedAverage = Number.isFinite(averageRating)
        ? Number(averageRating.toFixed(1))
        : 0;
    return (
        <div className="">
            <div className="flex flex-nowrap items-center gap-2">
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.round(averageRating) }).map((_, i) => (
                        <FaStar key={i} className="text-[#EBC80C]" size={20} />
                    ))}
                    <p className="text-[#191C1F]">{roundedAverage.toFixed(1)}</p>
                </div>
                <p className="text-[20px] text-[#5F6C72]">{`(${totalReviews}) Ratings`}</p>
            </div>
        </div>
    )
}