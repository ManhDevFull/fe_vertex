'use client';

import { memo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

type OrderToolbarProps = {
  title?: string;
  keyword: string;
  onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

function OrderToolbar({
  title = 'Orders',
  keyword,
  onKeywordChange,
  onSubmit,
  onReset,
}: OrderToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-medium text-[26px]">{title}</h1>
      <form onSubmit={onSubmit} className="flex w-full max-w-lg items-center gap-2 sm:w-auto">
        <input
          value={keyword}
          onChange={onKeywordChange}
          placeholder="Search by customer, product, status or order ID"
          className="h-10 w-full rounded-md border border-[#adadad] px-3 text-sm outline-none focus:border-gray-500 md:w-72"
        />
        <Button type="submit" className="h-10 px-5">
          Search
        </Button>
        <Button type="button" variant="outline" className="h-10 px-4" onClick={onReset}>
          Reset
        </Button>
      </form>
    </div>
  );
}

export default memo(OrderToolbar);
