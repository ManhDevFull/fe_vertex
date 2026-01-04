"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { FaCamera, FaStar, FaTimes } from "react-icons/fa";

import handleAPI from "@/axios/handleAPI";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  orderDetailId: number;
  onSuccess?: () => void;
  canEdit?: boolean;
}

type ExistingReview = {
  reviewId: number;
  rating: number;
  content: string;
  images: string[];
  createDate?: string;
  updateDate?: string;
  isUpdated?: boolean;
};

const MAX_IMAGES = 5;

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error: any) => {
  if (!error) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (error?.message) return String(error.message);
  if (error?.error) return String(error.error);
  return "Something went wrong.";
};

export default function ReviewDetailModal({
  open,
  onClose,
  productName,
  productImage,
  orderDetailId,
  onSuccess,
  canEdit = true,
}: ReviewModalProps) {
  const [review, setReview] = useState<ExistingReview | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isLocked = !canEdit || !!review?.isUpdated;
  const isFormDisabled = isLocked || isLoading;
  const canSubmit = canEdit && !review?.isUpdated && !isLoading;
  const submitLabel = review ? "Update review" : "Submit review";
  const headerLabel = review ? "Review details" : "Write a review";

  const resetUploads = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSelectedFiles([]);
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setReview(null);
    setExistingImages([]);
    setRating(5);
    setHoverRating(0);
    setContent("");
    resetUploads();

    // Load existing review (if any) when the modal opens.
    const loadReview = async () => {
      try {
        const response = await handleAPI(
          `api/Review/by-order-detail/${orderDetailId}`,
          undefined,
          "get"
        );
        const payload = response?.data ?? response ?? {};
        if (cancelled) return;

        if (payload?.reviewId) {
          const existingReview: ExistingReview = {
            reviewId: Number(payload.reviewId),
            rating: Number(payload.rating ?? 5),
            content: String(payload.content ?? ""),
            images: Array.isArray(payload.images) ? payload.images : [],
            createDate: payload.createDate,
            updateDate: payload.updateDate,
            isUpdated: Boolean(payload.isUpdated),
          };
          setReview(existingReview);
          setRating(existingReview.rating);
          setContent(existingReview.content);
          setExistingImages(existingReview.images);
        }
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err);
        const normalized = message.toLowerCase();
        if (!normalized.includes("review")) {
          setLoadError(message || "Unable to load review.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReview();
    return () => {
      cancelled = true;
    };
  }, [open, orderDetailId]);

  useEffect(() => {
    if (open) return;
    resetUploads();
  }, [open]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const filesArray = Array.from(event.target.files);
    if (!filesArray.length) return;

    if (selectedFiles.length + filesArray.length > MAX_IMAGES) {
      toast.error(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }

    const nextFiles = [...selectedFiles, ...filesArray];
    const nextPreviews = [
      ...previewUrls,
      ...filesArray.map((file) => URL.createObjectURL(file)),
    ];

    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    const nextFiles = [...selectedFiles];
    nextFiles.splice(index, 1);
    setSelectedFiles(nextFiles);

    const nextPreviews = [...previewUrls];
    const removed = nextPreviews.splice(index, 1);
    removed.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(nextPreviews);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!content.trim()) {
      toast.error("Please add a review comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("content", content.trim());

      selectedFiles.forEach((file) => {
        formData.append("Images", file);
      });

      if (review?.reviewId) {
        await handleAPI(`api/Review/${review.reviewId}`, formData, "put");
        toast.success("Review updated.");
      } else {
        formData.append("orderDetailId", orderDetailId.toString());
        await handleAPI("api/Review/create", formData, "post");
        toast.success("Review submitted.");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="centered"
      size="lg"
      showOverlay
      closeOnClickOutside
      showCloseButton
    >
      <ModalHeader className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{headerLabel}</h3>
          <p className="text-sm text-slate-500">
            Share your experience so other shoppers can decide faster.
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="gap-6">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <img
            src={productImage}
            alt={productName}
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
          />
          <div>
            <p className="font-semibold text-slate-900 line-clamp-2">
              {productName}
            </p>
            <p className="text-xs text-slate-500">
              Rate the product and leave a quick note.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Loading review details...
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {loadError}
          </div>
        ) : null}

        {review ? (
          <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
            <div className="flex flex-wrap gap-4">
              <span>Created: {formatDateTime(review.createDate) || "-"}</span>
              <span>Updated: {formatDateTime(review.updateDate) || "-"}</span>
              {review.isUpdated && (
                <span className="text-amber-600">
                  Update locked (already edited once).
                </span>
              )}
            </div>
          </div>
        ) : null}

        {!canEdit && !review ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Reviews unlock after delivery. Please check back later.
          </div>
        ) : null}

        <div>
          <p className="text-sm font-semibold text-slate-700">Rating</p>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => !isFormDisabled && setRating(star)}
                className="text-2xl transition-colors duration-200"
                disabled={isFormDisabled}
              >
                <FaStar
                  className={
                    star <= (hoverRating || rating)
                      ? "text-amber-400"
                      : "text-slate-300"
                  }
                />
              </button>
            ))}
            <span className="text-sm text-slate-500">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Your review</p>
          <textarea
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            rows={4}
            placeholder="Tell us what you liked or what can improve."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isFormDisabled}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Photos</p>
            <span className="text-xs text-slate-400">
              {selectedFiles.length}/{MAX_IMAGES}
            </span>
          </div>

          {existingImages.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-500">
                Current photos ({existingImages.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {existingImages.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt="Review"
                    className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
              {canSubmit && (
                <p className="mt-2 text-xs text-slate-400">
                  Upload new images to replace the current set.
                </p>
              )}
            </div>
          )}

          {canSubmit && (
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500">
                <FaCamera className="text-lg" />
                <span className="mt-1 text-[10px]">Add</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {previewUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
                >
                  <img
                    src={url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-slate-800"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          disabled={isSubmitting}
        >
          Close
        </button>
        {canSubmit && (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
