import type { ReactNode } from "react";
import styles from "./BrowserFrame.module.css";

type Props = {
  children: ReactNode;
  /** Shown in the address pill; omit for apps */
  url?: string;
  className?: string;
};

/** A DOM browser chrome around a screenshot so real captures can be swapped in later without re-compositing. */
export function BrowserFrame({ children, url, className }: Props) {
  return (
    <figure className={`${styles.frame} ${className ?? ""}`}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        {url ? <span className={styles.url}>{url.replace(/^https?:\/\//, "")}</span> : null}
      </div>
      <div className={styles.viewport}>{children}</div>
    </figure>
  );
}
