import type { ReactNode } from "react";
import styles from "./Tag.module.css";

type Props = {
  children: ReactNode;
  tone?: "default" | "accent";
  className?: string;
};

export function Tag({ children, tone = "default", className }: Props) {
  return <span className={`${styles.tag} ${tone === "accent" ? styles.accent : ""} ${className ?? ""}`}>{children}</span>;
}
