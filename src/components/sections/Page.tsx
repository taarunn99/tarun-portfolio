import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AuroraBackdrop } from "@/components/ui/AuroraBackdrop";
import styles from "./Page.module.css";

type Props = {
  children: ReactNode;
  theme?: "dark" | "paper";
};

/** Page shell: themed wrapper + header + main + footer. The theme flips tokens for this subtree. */
export function Page({ children, theme = "dark" }: Props) {
  return (
    <div className={styles.page} data-theme={theme === "paper" ? "paper" : undefined}>
      {theme === "paper" ? null : <AuroraBackdrop />}
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
