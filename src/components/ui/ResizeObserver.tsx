// components/ui/Expando.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  duration?: number; // ms
  children: React.ReactNode;
  className?: string;
};

export default function Expando({ open, duration = 260, children, className }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<string>("0px");
  const [animating, setAnimating] = useState(false);

  // đo lại height khi open hoặc content đổi size
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // dùng ResizeObserver để theo dõi con bên trong
    const ro = new ResizeObserver(() => {
      if (open && !animating) {
        // nếu đang mở và không animate, giữ auto; nếu đang animate, để yên
        setHeight(`${el.scrollHeight}px`);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, animating]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    setAnimating(true);
    if (open) {
      // 0 -> contentHeight -> 'auto' (sau khi xong)
      setHeight("0px");
      requestAnimationFrame(() => {
        const h = el.scrollHeight;
        setHeight(`${h}px`);
        // chuyển sang auto sau khi xong để responsive khi nội dung đổi
        const t = setTimeout(() => {
          setAnimating(false);
          setHeight("auto");
        }, duration);
        return () => clearTimeout(t);
      });
    } else {
      // auto/px -> contentHeight -> 0
      const from = el.scrollHeight;
      setHeight(`${from}px`);
      requestAnimationFrame(() => {
        setHeight("0px");
        const t = setTimeout(() => {
          setAnimating(false);
        }, duration);
        return () => clearTimeout(t);
      });
    }
  }, [open, duration]);

  return (
    <div
      style={{
        height,
        overflow: "hidden",
        transition: `height ${duration}ms cubic-bezier(0.25,0.8,0.25,1), 
                     opacity ${duration}ms ease, 
                     transform ${duration}ms ease`,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(-6px)",
        willChange: "height, opacity, transform",
      }}
      className={className}
      aria-hidden={!open}
    >
      <div ref={wrapRef}>{children}</div>
    </div>
  );
}
