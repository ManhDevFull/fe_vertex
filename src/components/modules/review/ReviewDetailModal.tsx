"use client";

import { useEffect, useState } from "react";
import handleAPI from "@/axios/handleAPI";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import LoaderText from "@/components/ui/LoadingText";
import { Button } from "@/components/ui/button";
import { IReviewAdmin } from "@/types/type";
import { formatDateTime, formatRating } from "@/utils/reviewHelpers";
import { formatVariant } from "@/utils/orderHelpers";

interface ReviewDetailModalProps {
  open: boolean;
  reviewId: number | null;
  fallback?: IReviewAdmin | null;
  onClose: () => void;
}

export default function ReviewDetailModal({
  open,
  reviewId,
  fallback,
  onClose,
}: ReviewDetailModalProps) {
  const [review, setReview] = useState<IReviewAdmin | null>(fallback ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && fallback) {
      setReview(fallback);
    }
  }, [open, fallback]);

  useEffect(() => {
    let cancelled = false;
    if (!open || !reviewId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await handleAPI(`/admin/Review/${reviewId}`);
        if (cancelled) return;
        if (res.status === 200) {
          console.log(res.data)
          setReview(res.data as IReviewAdmin);
        } else {
          setError("Review not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load review detail");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [open, reviewId]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="centered"
      size="lg"
      showOverlay
      
      className="bg-white"
    >
      <ModalHeader>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[#2b2b2b]">
            Review #{review?.id ?? reviewId ?? ""}
          </h3>
          {review && (
            <span className="text-xs text-gray-500">
              Submitted on {formatDateTime(review.createDate)}
            </span>
          )}
        </div>
        {review && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
            {formatRating(review.rating)}
          </span>
        )}
      </ModalHeader>
      <ModalBody className="gap-4" scrollable>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="w-32">
              <LoaderText />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : review ? (
          <div className="flex flex-col gap-4 text-sm text-[#474747]">
            <section className="rounded-lg border border-gray-200 bg-[#fafafa] px-4 py-3">
              <h4 className="mb-2 text-sm font-semibold text-[#242424]">Reviewer</h4>
              <p className="text-sm font-medium text-[#242424]">{review.customerName || "Unknown"}</p>
              <p className="text-xs text-gray-500 break-all">{review.customerEmail || "-"}</p>
            </section>
            <section className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-[#242424]">Product</h4>
              <p className="text-sm font-medium text-[#242424]">{review.productName}</p>
              <p className="text-xs text-gray-500">{formatVariant(review.variantAttributes)}</p>
            </section>
            <section className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-[#242424]">Review content</h4>
              <p className="text-sm text-[#2b2b2b] whitespace-pre-line">{review.content || "No content"}</p>
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.imageUrls.map((url, idx) => (
                    <img
                      key={`${url}-${idx}`}
                      src={url}
                      alt={`Review image ${idx + 1}`}
                      className="h-16 w-16 rounded-md border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-[#242424]">Timeline</h4>
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span>Created: {formatDateTime(review.createDate)}</span>
                <span>Updated: {formatDateTime(review.updateDate)}</span>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            No detail available for this review.
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" className="px-6" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
