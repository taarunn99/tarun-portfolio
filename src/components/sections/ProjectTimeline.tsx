import Link from "next/link";
import type { CSSProperties } from "react";
import { projectTimeline } from "@/content/timeline";
import { Heading } from "@/components/ui/Heading";
import { TimelineMotion } from "@/components/motion/TimelineMotion";
import styles from "./ProjectTimeline.module.css";

/** The year a project started, from its own period ("2025 to Oct 2026" is 2025). */
const startYear = (period: string, year: string) => period.match(/\d{4}/)?.[0] ?? year;

/**
 * Every project on one line, in the order it started. The section pins while
 * you scroll: the line glides sideways and slowly zooms in, each project
 * lights up as it reaches the current spot, then the whole line breaks into
 * dust and drifts away (motion/TimelineMotion). Without JavaScript, or under
 * reduced motion, it is a plain list.
 */
export function ProjectTimeline() {
  const items = projectTimeline;
  return (
    <section className={styles.timeline} aria-labelledby="timeline-title" data-timeline>
      <div className={styles.pin} data-pin>
        <header className={`container ${styles.head}`} data-head>
          <p className="eyebrow" data-dust>
            Timeline
          </p>
          <Heading as="h2" id="timeline-title" className={styles.title} text="Every project, in the order it shipped." accent="shipped." />
        </header>

        <div className={styles.stage} data-stage>
          <ol className={styles.track} data-track style={{ "--n": items.length } as CSSProperties}>
            <li className={styles.line} aria-hidden="true" data-line>
              <span className={styles.fill} data-fill />
            </li>
            {items.map((cs, i) => {
              const year = startYear(cs.period, cs.year);
              const prev = items[i - 1];
              const newYear = !prev || startYear(prev.period, prev.year) !== year;
              return (
                <li key={cs.slug} className={styles.item} data-item data-side={i % 2 ? "down" : "up"} style={{ "--i": i } as CSSProperties}>
                  {newYear ? (
                    <span className={styles.year} aria-hidden="true">
                      {year}
                    </span>
                  ) : null}
                  <span className={styles.dot} aria-hidden="true" data-dust />
                  <Link href={`/work/${cs.slug}`} className={styles.card}>
                    <span className={styles.when} data-dust>
                      {cs.period.split(" (")[0]}
                    </span>
                    <span className={styles.name} data-dust>
                      {cs.short}
                    </span>
                    <span className={styles.note} data-dust>
                      {cs.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>

        <canvas className={styles.dust} aria-hidden="true" data-dust-canvas />
      </div>
      <TimelineMotion />
    </section>
  );
}
