"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import handleAPI from "@/axios/handleAPI";
import Pagination from "@/components/ui/pageNavigation";
import ReviewToolbar from "@/components/templates/Admin/Review/Toolbar";
import ReviewFilters from "@/components/templates/Admin/Review/Filters";
import ReviewSummaryCards from "@/components/templates/Admin/Review/SummaryCards";
import ReviewsTable from "@/components/templates/Admin/Review/Table";
import ReviewDetailModal from "@/components/modules/review/ReviewDetailModal";
import ChooseModule from "@/components/modules/ChooseModal";
import { IReviewAdmin, IReviewSummary } from "@/types/type";

type FilterState = {
  rating: string;
  status: string;
  keyword: string;
  fromDate: string;
  toDate: string;
};

const DEFAULT_FILTER: FilterState = {
  rating: "ALL",
  status: "ALL",
  keyword: "",
  fromDate: "",
  toDate: "",
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  if (error && typeof error === "object") {
    const maybeMessage = (error as { message?: unknown }).message;
    const dataMessage = (error as { data?: { message?: unknown } }).data?.message;
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;
    const resolved = [maybeMessage, dataMessage, responseMessage].find(
      (msg): msg is string => typeof msg === "string" && msg.trim().length > 0
    );
    if (resolved) return resolved;
  }
  return fallback;
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState<IReviewAdmin[]>([]);
  const [summary, setSummary] = useState<IReviewSummary | null>(null);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [pendingKeyword, setPendingKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReviewAdmin | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    review: IReviewAdmin | null;
    nextStatus: boolean;
    message: string;
  }>({
    open: false,
    review: null,
    nextStatus: false,
    message: "",
  });
  const [updating, setUpdating] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  const refreshReviews = () => setReloadFlag((flag) => flag + 1);

  useEffect(() => {
    setPendingKeyword(DEFAULT_FILTER.keyword);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("size", String(pageSize));
      if (filter.rating !== "ALL") params.set("rating", filter.rating);

      const hasKeyword = Boolean(filter.keyword.trim());
      if (filter.status !== "ALL" && !hasKeyword) {
        params.set("updated", filter.status === "UPDATED" ? "true" : "false");
      }

      if (hasKeyword) params.set("keyword", filter.keyword.trim());
      if (filter.fromDate) params.set("fromDate", filter.fromDate);
      if (filter.toDate) params.set("toDate", filter.toDate);

      try {
        const res = await handleAPI(`admin/Review?${params.toString()}`);
        if (cancelled) return;
        if (res.status === 200) {
          console.log(res.data)
          setReviews(Array.isArray(res.data?.items) ? res.data.items : []);
          setTotal(Number(res.data?.total) || 0);
          setSummary(res.data?.summary ?? null);
        } else {
          setReviews([]);
          setTotal(0);
          setSummary(null);
        }
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setTotal(0);
          setSummary(null);
          setError(extractErrorMessage(err, "Không thể tải danh sách đánh giá"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [filter, page, pageSize, reloadFlag]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const summaryCards = useMemo(() => {
    if (!summary) {
      return [
        { label: "Total reviews", value: "-", accent: "bg-[#f5f5f5]" },
        { label: "Updated", value: "-", accent: "bg-emerald-50" },
        { label: "Average rating", value: "-", accent: "bg-amber-50" },
      ];
    }
    return [
      { label: "Total reviews", value: summary.total, accent: "bg-[#f5f5f5]" },
      { label: "Updated", value: summary.updated, accent: "bg-emerald-50" },
      { label: "Average rating", value: summary.averageRating.toFixed(2), accent: "bg-amber-50" },
    ];
  }, [summary]);

  const handleSelectChange = (key: keyof FilterState) => (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setPage(1);
    setSuccessMessage(null);
    setError(null);
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (key: keyof FilterState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPage(1);
    setSuccessMessage(null);
    setError(null);
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = pendingKeyword.trim();
    setPage(1);
    setSuccessMessage(null);
    setError(null);
    setFilter((prev) => ({ ...prev, keyword: trimmed }));
  };

  const handleResetFilters = () => {
    setFilter(DEFAULT_FILTER);
    setPendingKeyword("");
    setPage(1);
    setSuccessMessage(null);
    setError(null);
  };

  const closeConfirm = () => {
    setUpdating(false);
    setConfirmState({
      open: false,
      review: null,
      nextStatus: false,
      message: "",
    });
  };

  const handleViewDetail = (review: IReviewAdmin) => {
    setSelectedReview(review);
    setDetailModalOpen(true);
  };

  const promptStatusChange = (review: IReviewAdmin, nextStatus: boolean) => {
    setConfirmState({
      open: true,
      review,
      nextStatus,
      message: nextStatus
        ? `Lock review #${review.id} after user update?`
        : `Re-open review #${review.id} for editing?`,
    });
  };

  const handleConfirmStatus = async () => {
    if (updating || !confirmState.review) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await handleAPI(
        `/admin/Review/${confirmState.review.id}/status`,
        { isUpdated: confirmState.nextStatus },
        "put"
      );
      if (res.status === 200) {
        setSuccessMessage(
          `Review #${confirmState.review.id} marked as ${
            confirmState.nextStatus ? "locked after update" : "original/editable"
          }.`
        );
        closeConfirm();
        refreshReviews();
        setSelectedReview((prev) =>
          prev && prev.id === confirmState.review?.id
            ? { ...prev, isUpdated: confirmState.nextStatus, updateDate: new Date().toISOString() }
            : prev
        );
      } else {
        setError("Không thể cập nhật đánh giá");
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Không thể cập nhật đánh giá"));
    } finally {
      setUpdating(false);
    }
  };

  const confirmButtonClass = confirmState.nextStatus
    ? "bg-[#047857] text-white"
    : "bg-[#f97316] text-white";

  return (
    <div className="rounded-lg bg-[#D9D9D940] p-3 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] w-full h-full">
      <ReviewToolbar
        keyword={pendingKeyword}
        onKeywordChange={(event) => setPendingKeyword(event.target.value)}
        onSubmit={handleSearch}
        onReset={handleResetFilters}
      />

      <ReviewSummaryCards cards={summaryCards} />

      <ReviewFilters
        filter={{
          rating: filter.rating,
          status: filter.status,
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        }}
        onRatingChange={handleSelectChange("rating")}
        onStatusChange={handleSelectChange("status")}
        onFromDateChange={handleDateChange("fromDate")}
        onToDateChange={handleDateChange("toDate")}
      />

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <ReviewsTable
        reviews={reviews}
        loading={loading}
        onView={handleViewDetail}
        onMarkUpdated={(review) => promptStatusChange(review, true)}
        onMarkPending={(review) => promptStatusChange(review, false)}
      />

      <div className="mt-4">
        <Pagination
          type="reviews"
          label="reviews"
          totalPage={totalPages}
          page={page}
          totalProduct={total}
          onChangePage={setPage}
          siblingCount={1}
        />
      </div>

      <ReviewDetailModal
        open={detailModalOpen}
        reviewId={selectedReview?.id ?? null}
        fallback={selectedReview}
        onClose={() => setDetailModalOpen(false)}
      />
      <ChooseModule
        text={confirmState.message || "Confirm?"}
        open={confirmState.open}
        onClose={closeConfirm}
        styleYes={`${confirmButtonClass} ${updating ? "pointer-events-none opacity-60" : ""}`}
        onYes={() => {
          if (!updating) {
            handleConfirmStatus();
          }
        }}
      />
    </div>
  );
}
