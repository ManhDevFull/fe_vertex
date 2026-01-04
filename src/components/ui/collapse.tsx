"use client";
import { useEffect, useRef, useState, memo } from "react";

interface CollapseProps {
  isOpen: boolean;
  duration?: number;
  children: React.ReactNode;
}

const Collapse = memo(function Collapse({
  isOpen,
  duration = 400,
  children,
}: CollapseProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<string>("0px");
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (isOpen) {
      setRender(true);
      setMaxH("0px");
      requestAnimationFrame(() => {
        const h = el.scrollHeight;
        setMaxH(`${h}px`);
      });
      const t = setTimeout(() => {
        setMaxH("none");
      }, duration);
      return () => clearTimeout(t);
    } else {
      const h = el.scrollHeight;
      setMaxH(`${h}px`);
      requestAnimationFrame(() => setMaxH("0px"));
      const t = setTimeout(() => setRender(false), duration);
      return () => clearTimeout(t);
    }
  }, [isOpen, duration]);

  return (
    <div
      style={{
        maxHeight: maxH,
        overflow: "hidden",
        transition: `max-height ${duration}ms cubic-bezier(0.25, 0.8, 0.25, 1),
                     opacity ${duration}ms ease,
                     transform ${duration}ms ease`,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0)" : "translateY(-6px)",
      }}
    >
      <div ref={innerRef}>{render && children}</div>
    </div>
  );
});

export default Collapse;
