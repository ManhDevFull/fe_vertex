import React from "react";

/**
 * Reusable Skeleton Component (no clsx)
 * type: "text" | "img" | "title"
 */

interface SkeletonProps {
  type?: "text" | "img" | "title";
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "md" | "lg" | "full";
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = "text",
  className = "",
  width,
  height,
  rounded = "lg",
  lines = 1,
}) => {
  const base = "animate-pulse bg-gray-300 dark:bg-gray-700";
  const roundedClass = rounded === "md"
    ? "rounded-md"
    : rounded === "full"
    ? "rounded-full"
    : "rounded-lg";

  const merged = `${base} ${roundedClass} ${className}`;

  if (type === "img") {
    return (
      <div
        className={merged}
        style={{ width: width || "100%", height: height || "200px" }}
      />
    );
  }

  if (type === "title") {
    return (
      <div
        className={merged}
        style={{ width: width || "60%", height: height || "24px" }}
      />
    );
  }

  // text nhiều dòng
  if (type === "text") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={merged}
            style={{ width: width || "100%", height: height || "14px" }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default Skeleton;