import { formatDateTime as sharedFormatDateTime } from "@/utils/orderHelpers";

export const REVIEW_RATING_OPTIONS = [
  { value: "ALL", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

export const REVIEW_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "UPDATED", label: "Updated (locked)" },
  { value: "PENDING", label: "Original (editable)" },
];

export const formatRating = (rating: number) => `${rating}★`;

export const formatDateTime = sharedFormatDateTime;

export const REVIEW_STATUS_STYLES: Record<string, string> = {
  UPDATED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-600",
};
