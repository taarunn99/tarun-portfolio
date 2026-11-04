"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useMotion, isInViewport } from "./useMotion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds between lines */
  stagger?: number;
};

/**
 * Masked line reveal (SplitText `mask: 'lines'`, yPercent 110 → 0, expo.out).
 * SplitText is loaded on demand and only applied to headings still below
 * the fold, after fonts are ready, so there is never a layout shift or an
 * LCP penalty. Accessible text is preserved via SplitText's aria handling.
 */
export function SplitLines({ children, as, className, stagger = 0.08 }: Props) {
  const Tag = (as ?? "h2") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useMotion(({ gsap, ScrollTrigger }) => {
    const el = ref.current;
    if (!el || isInViewport(el, -40)) return;

    let split: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const { SplitText } = await import("gsap/SplitText");
      await document.fonts.ready;
      if (cancelled) return;
      gsap.registerPlugin(SplitText);

      split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.8,
            ease: "expo.out",
            stagger,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }),
      });
    })();

    return () => {
      cancelled = true;
      split?.revert();
      ScrollTrigger.refresh();
    };
  });

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
