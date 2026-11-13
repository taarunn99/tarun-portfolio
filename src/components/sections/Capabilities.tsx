import type { CSSProperties } from "react";
import { capabilities } from "@/content/capabilities";
import { Heading } from "@/components/ui/Heading";
import { StoryScroll } from "@/components/motion/StoryScroll";
import styles from "./Capabilities.module.css";

/**
 * Where each department sits around the dot, in % of the ring area
 * (left column, then right column, top to bottom).
 */
const SPOTS: Array<[number, number]> = [
  [31, 16],
  [31, 50],
  [31, 84],
  [69, 16],
  [69, 50],
  [69, 84],
];

/**
 * "One person, six departments" as a pinned scroll: a single dot, then a
 * hairline draws out to each department in turn and its card fades in.
 * Phones show one department at a time under the dot. Pure CSS on `--p`
 * (motion/StoryScroll); a plain grid under reduced motion.
 */
export function Capabilities() {
  return (
    <section className={styles.section} aria-labelledby="cap-title" data-story>
      <StoryScroll id="cap-title" targets="[data-cp]" />
      <div className={styles.stage}>
        <header className={`container ${styles.head}`}>
          <p className="eyebrow">What I run</p>
          <Heading as="h2" id="cap-title" className={styles.title} text="One person, six departments." accent="six" />
          <p className={styles.lead}>
            At Lapiz Group I own the websites, the ad account, the ERP, the automations, the brand work and the IT, and I measure each one in money.
          </p>
        </header>

        <div className={`container ${styles.ring}`} data-cp style={{ "--p": 0 } as CSSProperties}>
          <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {SPOTS.map(([x, y], i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x < 50 ? x + 1 : x - 1}
                y2={y}
                pathLength={100}
                className={styles.beam}
                style={{ "--k": i } as CSSProperties}
              />
            ))}
          </svg>

          <div className={styles.core} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.coreLabel}>One person</span>
            <span className={styles.ticks}>
              {capabilities.map((c, i) => (
                <i key={c.id} style={{ "--k": i } as CSSProperties} />
              ))}
            </span>
          </div>

          <ul className={styles.cards}>
            {capabilities.map((c, i) => {
              const [x, y] = SPOTS[i] ?? [50, 50];
              return (
                <li
                  key={c.id}
                  className={styles.card}
                  data-side={x < 50 ? "left" : "right"}
                  style={{ "--k": i, "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
                >
                  {c.stat ? (
                    <p className={styles.stat}>
                      <span className={styles.value}>{c.stat.value}</span>
                      <span className={styles.label}>{c.stat.label}</span>
                    </p>
                  ) : null}
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.blurb}>{c.blurb}</p>
                  <ul className={styles.tools} aria-label={`${c.title} tools`}>
                    {c.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
