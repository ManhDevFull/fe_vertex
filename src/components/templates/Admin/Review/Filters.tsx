'use client';

import type { ChangeEvent } from 'react';
import { REVIEW_RATING_OPTIONS, REVIEW_STATUS_OPTIONS } from '@/utils/reviewHelpers';

export type ReviewFilterValues = {
  rating: string;
  status: string;
  fromDate: string;
  toDate: string;
};

type ReviewFiltersProps = {
  filter: ReviewFilterValues;
  onRatingChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onStatusChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onFromDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ReviewFilters({
  filter,
  onRatingChange,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
}: ReviewFiltersProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <select
        value={filter.rating}
        onChange={onRatingChange}
        className="h-10 rounded-md border border-[#CBCBCB] bg-white px-3 text-sm text-[#474747] outline-none focus:border-gray-500"
      >
        {REVIEW_RATING_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={filter.status}
        onChange={onStatusChange}
        className="h-10 rounded-md border border-[#CBCBCB] bg-white px-3 text-sm text-[#474747] outline-none focus:border-gray-500"
      >
        {REVIEW_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#5a5a5a]">From</label>
        <input
          type="date"
          value={filter.fromDate}
          onChange={onFromDateChange}
          className="h-10 rounded-md border border-[#CBCBCB] bg-white px-3 text-sm text-[#474747] outline-none focus:border-gray-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#5a5a5a]">To</label>
        <input
          type="date"
          value={filter.toDate}
          onChange={onToDateChange}
          className="h-10 rounded-md border border-[#CBCBCB] bg-white px-3 text-sm text-[#474747] outline-none focus:border-gray-500"
        />
      </div>
    </div>
  );
}
