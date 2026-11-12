import type { CSSProperties } from "react";
import styles from "./AuroraBackdrop.module.css";

/**
 * A few brighter stars that twinkle and swell as the page scrolls:
 * x and y in % of the viewport, size in px, twinkle period in s, phase.
 * Fixed positions (no randomness during prerender), spread so a phone
 * screen still holds a handful.
 */
const STARS: Array<[number, number, number, number, number, boolean?]> = [
  [8, 14, 2.4, 4.2, 0, true],
  [23, 38, 1.6, 5.6, 1.3],
  [37, 9, 1.8, 6.4, 2.1],
  [52, 27, 2.8, 4.8, 0.6, true],
  [66, 12, 1.6, 5.2, 3.2],
  [81, 31, 2.2, 6.8, 1.7],
  [93, 8, 1.7, 4.4, 2.6],
  [14, 62, 1.8, 6.1, 0.9],
  [44, 71, 2.0, 5.4, 3.6],
  [72, 56, 2.6, 4.6, 1.1, true],
  [88, 78, 1.6, 6.6, 2.4],
  [30, 88, 1.8, 5.0, 0.3],
  [59, 92, 1.6, 6.2, 1.9],
  [4, 45, 1.6, 5.8, 2.9],
];

/** Shooting stars: start x/y %, travel angle (deg), cycle (s), first appearance (s). */
const METEORS: Array<[number, number, number, number, number]> = [
  [78, 6, 152, 14, 2.5],
  [46, 2, 160, 23, 9],
  [96, 22, 148, 31, 16],
  [62, 12, 156, 41, 27],
];

/**
 * Fixed aurora sky behind dark pages. Static markup; all motion is CSS on
 * transform and opacity (compositor only), so it costs the main thread
 * nothing: ray-streaked curtains that drift with scroll, a handful of
 * glowing stars that twinkle and swell as you scroll, and the odd hair-thin
 * shooting star. Still under reduced motion.
 */
export function AuroraBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.stars} />
      <div className={`${styles.curtain} ${styles.curtainA}`}>
        <div className={styles.glow} />
        <div className={`${styles.rays} ${styles.raysA}`} />
        <div className={`${styles.rays} ${styles.raysB}`} />
      </div>
      <div className={`${styles.curtain} ${styles.curtainB}`}>
        <div className={styles.glow} />
        <div className={`${styles.rays} ${styles.raysB}`} />
      </div>
      <div className={styles.twinkles}>
        {STARS.map(([x, y, s, d, ph, flare], i) => (
          <span
            key={i}
            className={styles.twinkle}
            data-flare={flare ? "" : undefined}
            style={{ "--x": `${x}%`, "--y": `${y}%`, "--s": `${s}px`, "--d": `${d}s`, "--ph": `${-ph}s` } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.meteors}>
        {METEORS.map(([x, y, r, d, at], i) => (
          <span
            key={i}
            className={styles.meteor}
            data-slow={d > 25 ? "" : undefined}
            style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${r}deg`, "--d": `${d}s`, "--at": `${at}s` } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.fog} />
    </div>
  );
}
