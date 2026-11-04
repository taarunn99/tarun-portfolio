import type { ReactNode } from "react";
import styles from "./Marquee.module.css";

type Props = {
  items: readonly ReactNode[];
  /** Seconds per loop */
  speed?: number;
  className?: string;
  label?: string;
};

/**
 * CSS-only marquee: content duplicated once (second copy aria-hidden),
 * translates −50% in a loop, pauses on hover/focus, static under reduced motion.
 */
export function Marquee({ items, speed = 50, className, label }: Props) {
  const row = (hidden: boolean) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`${styles.marquee} ${className ?? ""}`}
      style={{ ["--marquee-speed" as string]: `${speed}s` }}
      aria-label={label}
      role={label ? "region" : undefined}
    >
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
