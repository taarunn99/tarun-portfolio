import type { Metric } from "@/content/types";
import { Counter } from "@/components/motion/Counter";
import styles from "./Numeral.module.css";

type Props = {
  metric: Metric;
  size?: "lg" | "md" | "sm";
  animate?: boolean;
  className?: string;
};

/** Oversized tabular number with its label — the unit of proof on this site. */
export function Numeral({ metric, size = "md", animate = true, className }: Props) {
  return (
    <div className={`${styles.numeral} ${styles[size]} ${className ?? ""}`}>
      <span className={styles.value}>
        {animate ? <Counter value={metric.value} /> : metric.value}
      </span>
      <span className={styles.label}>
        {metric.label}
        {metric.note ? <span className={styles.note}> · {metric.note}</span> : null}
      </span>
    </div>
  );
}
