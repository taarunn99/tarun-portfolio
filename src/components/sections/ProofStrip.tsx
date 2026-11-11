import type { CSSProperties } from "react";
import { proof, marquee } from "@/content/site";
import { Marquee } from "@/components/ui/Marquee";
import { StoryScroll } from "@/components/motion/StoryScroll";
import { ProofScene } from "@/components/scene/proof/ProofScene";
import styles from "./ProofStrip.module.css";

/**
 * The proof numbers as a short pinned story: one number at a time, centre
 * stage. With motion on, scene/proof draws each number in particles that fly
 * from one number into the next as you scroll and scatter around the
 * pointer. The HTML numbers below are the DOM twin: they show (and cross
 * fade on `--p`) until the particles take over, and they are what screen
 * readers, search and reduced motion get.
 */
export function ProofStrip() {
  const total = String(proof.length).padStart(2, "0");
  return (
    <>
      <section id="proof" className={styles.proof} aria-labelledby="proof-title" data-story style={{ "--p": 0 } as CSSProperties}>
        <StoryScroll id="proof-title" />
        <div className={styles.stage}>
          <ProofScene />
          <div className={`container ${styles.head}`}>
            <p className="eyebrow">In numbers</p>
            <h2 id="proof-title" className={styles.title}>
              Six results, each one <em className="accent-word">sourced</em>
            </h2>
          </div>
          <ol className={styles.slides}>
            {proof.map((m, i) => {
              const vars = {
                "--a": i === 0 ? -9 : i - 0.15,
                "--b": i === proof.length - 1 ? 99 : i + 0.8,
              } as CSSProperties;
              return (
                <li key={m.label} className={styles.slide} style={vars}>
                  <span className={styles.value} data-value>
                    {m.value}
                  </span>
                  <p className={styles.label}>
                    <span className={styles.index} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")} / {total}
                    </span>
                    {m.label}
                    {m.note ? <span className={styles.note}>{m.note}</span> : null}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <div className={styles.marquee}>
        <Marquee items={marquee} label="Stack" />
      </div>
    </>
  );
}
