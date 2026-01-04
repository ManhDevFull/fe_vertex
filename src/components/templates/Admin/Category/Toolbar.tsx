'use client';

type CategoryToolbarProps = {
  onCreateRoot: () => void;
};

export default function CategoryToolbar({ onCreateRoot }: CategoryToolbarProps) {
  return (
    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-[26px] font-medium text-[#2f2f2f]">Categories</h1>
      <button
        type="button"
        onClick={onCreateRoot}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-100 md:w-auto"
      >
        <span className="text-lg leading-none">＋</span>
        <span className="md:hidden">Add category</span>
        <span className="hidden md:inline">Create category</span>
      </button>
    </div>
  );
}
