import Link from "next/link";
import type { CSSProperties } from "react";
import { projectTimeline } from "@/content/timeline";
import { Heading } from "@/components/ui/Heading";
import { StoryScroll } from "@/components/motion/StoryScroll";
import styles from "./ProjectTimeline.module.css";

/**
 * Every project on one line, in the order it started. A pinned sideways
 * scroll: scrolling down slides the line left, the line fills in behind you
 * and the project at the centre lights up (dot, card, colour); the rest wait
 * dimmed. A big faint year marks where each year starts. Pure CSS on `--p`
 * (motion/StoryScroll, written only on the track and fill); a plain list
 * under reduced motion.
 */
export function ProjectTimeline() {
  const items = projectTimeline;
  return (
    <section className={styles.timeline} aria-labelledby="timeline-title" data-story style={{ "--n": items.length } as CSSProperties}>
      <StoryScroll id="timeline-title" targets="[data-tp]" />
      <div className={styles.stage}>
        <header className={`container ${styles.head}`}>
          <p className="eyebrow">Timeline</p>
          <Heading as="h2" id="timeline-title" className={styles.title} text="Every project, in the order it shipped." accent="shipped." />
        </header>

        <div className={styles.rail} aria-hidden="true" />

        <ol className={styles.track} data-tp>
          <li className={styles.fill} aria-hidden="true" />
          {items.map((cs, i) => {
            // the year it started, from its own period ("2025 to Oct 2026" is 2025)
            const startYear = (c: (typeof items)[number] | undefined) => c?.period.match(/\d{4}/)?.[0] ?? c?.year;
            const year = startYear(cs);
            const newYear = i === 0 || startYear(items[i - 1]) !== year;
            const when = cs.period.split(" (")[0];
            return (
              <li key={cs.slug} className={styles.item} data-side={i % 2 ? "down" : "up"} style={{ "--i": i } as CSSProperties}>
                {newYear ? (
                  <span className={styles.year} aria-hidden="true">
                    {year}
                  </span>
                ) : null}
                <span className={styles.dot} aria-hidden="true" />
                <Link href={`/work/${cs.slug}`} className={styles.card}>
                  <span className={styles.when}>{when}</span>
                  <span className={styles.name}>{cs.short}</span>
                  <span className={styles.line}>{cs.title}</span>
                  <span className={styles.tags}>
                    {cs.tags.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
