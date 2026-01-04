import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export default function Panel({
  title,
  description,
  icon,
  actions,
  className = "",
  contentClassName = "",
  children,
}: PanelProps) {
  const hasHeader = Boolean(title || description || icon || actions);

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
      )}
      <div className={`px-6 py-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}
