"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const formatSegment = (segment: string) => {
  const decoded = decodeURIComponent(segment.replace(/\+/g, " "));
  if (!decoded) return "";

  if (/^\d+$/.test(decoded)) return decoded;

  return decoded
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function NavigationPath() {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [
    { label: "Home", href: "/" },
    ...segments
      .map((segment, index) => {
        const label = formatSegment(segment);
        if (!label) return null;
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        return { label, href };
      })
      .filter(Boolean),
  ] as { label: string; href: string }[];

  if (crumbs.length === 1) {
    return (
      <nav
        className="w-full px-10 md:px-15 py-2 xl:px-40 text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <span className="font-medium text-slate-700">{crumbs[0].label}</span>
      </nav>
    );
  }

  return (
    <nav
      className="w-full px-10 md:px-15 py-2 xl:px-40 text-sm text-slate-500"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-slate-700" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-slate-700">
                  {crumb.label}
                </Link>
              )}
              {!isLast && <span className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
