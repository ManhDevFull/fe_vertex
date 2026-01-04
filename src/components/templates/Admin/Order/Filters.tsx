'use client';

import { memo } from 'react';
import type { ChangeEvent } from 'react';
import { STATUS_OPTIONS } from '@/utils/orderHelpers';

export type OrderFilterValues = {
  status: string;
  fromDate: string;
  toDate: string;
};

type OrderFiltersProps = {
  filter: OrderFilterValues;
  onStatusChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onFromDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function OrderFilters({
  filter,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
}: OrderFiltersProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <select
        value={filter.status}
        onChange={onStatusChange}
        className="h-10 rounded-md border border-[#CBCBCB] bg-white px-3 text-sm text-[#474747] outline-none focus:border-gray-500"
      >
        {STATUS_OPTIONS.map((option) => (
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

export default memo(OrderFilters);
