'use client';

type SummaryCard = {
  label: string;
  value: string | number;
  accent: string;
};

type ReviewSummaryCardsProps = {
  cards: SummaryCard[];
};

export default function ReviewSummaryCards({ cards }: ReviewSummaryCardsProps) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((item, index) => (
        <div key={`${item.label}-${index}`} className="rounded-lg border border-[#ECECEC] bg-white shadow-sm">
          <div className={`flex flex-col gap-1 rounded-t-lg px-4 py-3 ${item.accent}`}>
            <span className="text-sm text-[#6b6b6b]">{item.label}</span>
            <strong className="text-xl text-[#2b2b2b]">{item.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
