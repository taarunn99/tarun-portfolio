"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { useMotion, isInViewport } from "./useMotion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Animate direct children with a stagger instead of the wrapper */
  stagger?: boolean;
  /** Distance in px for the translate-up */
  distance?: number;
  delay?: number;
};

/**
 * Scroll reveal. Content is visible by default; once the motion runtime
 * loads, elements still below the fold get a one-time transform/opacity
 * entrance. Never hides anything already on screen (LCP/CLS safe).
 */
export function Reveal({ children, as, className, stagger = false, distance = 24, delay = 0 }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useMotion(({ gsap, ScrollTrigger }) => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger ? Array.from(el.children) : [el];
    const pending = targets.filter((t) => !isInViewport(t, -40));
    if (pending.length === 0) return;

    // opacity only (never visibility:hidden) so keyboard focus can still reach the content;
    // a focus inside the block completes the reveal immediately.
    const tween = gsap.from(pending, {
      y: distance,
      opacity: 0,
      duration: 0.8,
      ease: "power4.out",
      stagger: stagger ? 0.06 : 0,
      delay,
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
    const onFocus = () => {
      tween.scrollTrigger?.kill();
      tween.progress(1);
    };
    el.addEventListener("focusin", onFocus, { once: true });

    return () => {
      el.removeEventListener("focusin", onFocus);
      tween.scrollTrigger?.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  });

  return (
    <Tag ref={ref} className={className} data-reveal>
      {children}
    </Tag>
  );
}
