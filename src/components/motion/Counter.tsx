"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Final display string, e.g. "776,478", "9.2×", "AED 2.27M", "95–100" */
  value: string;
  className?: string;
  duration?: number;
};

/**
 * Counts a number up when it enters the viewport. The final value is in the
 * HTML (SEO, no-JS, reduced motion); only the leading numeric part animates.
 * ~0.6 KB, no GSAP dependency.
 */
export function Counter({ value, className, duration = 1400 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const match = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const [, prefix, num, suffix] = match;
    const target = Number(num.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;
    const decimals = (num.split(".")[1] ?? "").length;
    const grouped = num.includes(",");
    const fmt = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouped,
    });

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(2, -10 * t); // expo.out
          el.textContent = `${prefix}${fmt.format(target * eased)}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(tick);
          else el.textContent = value;
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
