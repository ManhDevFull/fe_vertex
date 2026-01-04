'use client';

import LoaderText from '@/components/ui/LoadingText';
import ReviewAction from '@/components/templates/Admin/ReviewAction';
import type { IReviewAdmin } from '@/types/type';
import {
  REVIEW_STATUS_STYLES,
  formatDateTime,
  formatRating,
} from '@/utils/reviewHelpers';
import { badgeClass, formatVariant } from '@/utils/orderHelpers';

type ReviewsTableProps = {
  reviews: IReviewAdmin[];
  loading: boolean;
  onView: (review: IReviewAdmin) => void;
  onMarkUpdated: (review: IReviewAdmin) => void;
  onMarkPending: (review: IReviewAdmin) => void;
};

export default function ReviewsTable({
  reviews,
  loading,
  onView,
  onMarkUpdated,
  onMarkPending,
}: ReviewsTableProps) {
  return (
    <div className="relative mt-4 rounded-lg border border-gray-200 bg-white shadow">
      <div
        className={`grid grid-cols-24 overflow-hidden rounded-t-lg bg-[#f4f4f4] text-[#474747] ${
          loading ? 'opacity-50' : ''
        }`}
      >
        <div className="col-span-3 py-3 text-center text-sm font-medium">Review</div>
        <div className="col-span-4 py-3 pl-3 text-sm font-medium">Customer</div>
        <div className="col-span-5 py-3 pl-3 text-sm font-medium">Product</div>
        <div className="col-span-2 py-3 text-center text-sm font-medium">Rating</div>
        <div className="col-span-4 py-3 pl-3 text-sm font-medium">Content</div>
        <div className="col-span-4 py-3 text-center text-sm font-medium">Status</div>
        <div className="col-span-2 py-3 text-center text-sm font-medium">Actions</div>

        <div className="col-span-24 overflow-y-auto bg-white scrollbar-hidden" style={{ maxHeight: 'calc(100vh - 440px)' }}>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderText />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-[#474747]">
              <p className="text-sm text-gray-500">No reviews matched the current filters.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-24 items-start border-t border-[#00000008] bg-white text-[#474747]"
              >
                <div className="col-span-3 flex h-full flex-col items-center justify-center gap-1 py-3 text-center">
                  <span className="text-sm font-medium text-[#2b2b2b]">#{review.id}</span>
                  <span className="text-xs text-gray-500">{formatDateTime(review.createDate)}</span>
                </div>
                <div className="col-span-4 flex h-full flex-col justify-center gap-1 border-l border-[#00000008] px-3 py-3">
                  <span className="text-sm font-medium text-[#242424]">{review.customerName || 'Unknown reviewer'}</span>
                  <span className="text-xs text-gray-500 break-all">{review.customerEmail || '-'}</span>
                </div>
                <div className="col-span-5 flex h-full gap-3 border-l border-[#00000008] px-3 py-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-[#fafafa]">
                    {review.productImage ? (
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">N/A</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[#242424]">{review.productName}</span>
                    <span className="text-xs text-gray-500">{formatVariant(review.variantAttributes)}</span>
                  </div>
                </div>
                <div className="col-span-2 flex h-full flex-col items-center justify-center gap-1 border-l border-[#00000008] py-3 text-sm font-semibold text-[#242424]">
                  {formatRating(review.rating)}
                </div>
                <div className="col-span-4 flex h-full flex-col justify-center gap-2 border-l border-[#00000008] px-3 py-3 text-sm text-[#2b2b2b]">
                  <span className="max-h-[72px] overflow-hidden whitespace-pre-line">
                    {review.content || 'No content'}
                  </span>
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {review.imageUrls.slice(0, 3).map((url, idx) => (
                        <img
                          key={`${url}-${idx}`}
                          src={url}
                          alt={`Review image ${idx + 1}`}
                          className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                        />
                      ))}
                      {review.imageUrls.length > 3 && (
                        <span className="text-xs text-gray-500">+{review.imageUrls.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-4 flex h-full flex-col items-center justify-center gap-2 border-l border-[#00000008] py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase ${badgeClass(
                      review.isUpdated ? 'UPDATED' : 'PENDING',
                      REVIEW_STATUS_STYLES,
                    )}`}
                  >
                    {review.isUpdated ? 'UPDATED (LOCKED)' : 'ORIGINAL (EDITABLE)'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {review.isUpdated
                      ? `Locked on ${formatDateTime(review.updateDate)}`
                      : 'Editable – awaiting first update'}
                  </span>
                </div>
                <div className="col-span-2 flex h-full items-center justify-center border-l border-[#00000008] py-3">
                  <ReviewAction
                    isUpdated={review.isUpdated}
                    onView={() => onView(review)}
                    onMarkUpdated={() => onMarkUpdated(review)}
                    onMarkPending={() => onMarkPending(review)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
