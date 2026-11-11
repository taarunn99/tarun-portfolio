import Link from "next/link";
import type { CSSProperties } from "react";
import { featuredCaseStudies } from "@/content/case-studies";
import { Heading } from "@/components/ui/Heading";
import { StoryScroll } from "@/components/motion/StoryScroll";
import { FlipCard } from "./FlipCard";
import styles from "./FeaturedWork.module.css";

/**
 * Selected work as a pinned sideways scroll: scrolling down moves the row of
 * cards left, one screen of scroll per screen of cards. The track length and
 * the section height are both worked out in CSS from the card count, so
 * nothing is measured in JS; `--p` (motion/StoryScroll) only drives the
 * shift. Each card flips to show its numbers (FlipCard). Under reduced
 * motion the row is a plain swipeable strip.
 */
export function FeaturedWork() {
  const items = featuredCaseStudies.slice(0, 6);
  return (
    <section
      className={styles.work}
      aria-labelledby="work-title"
      data-story
      style={{ "--p": 0, "--n": items.length } as CSSProperties}
    >
      <StoryScroll id="work-title" />
      <div className={styles.stage}>
        <header className={`container ${styles.head}`}>
          <p className="eyebrow">Selected work</p>
          <Heading as="h2" id="work-title" className={styles.title} text="Products that shipped, with the numbers." accent="numbers" />
          <Link href="/work" className={styles.all}>
            All work
          </Link>
        </header>
        <div className={styles.viewport}>
          <ol className={styles.track}>
            {items.map((cs, i) => (
              <li key={cs.slug} className={styles.item}>
                <FlipCard cs={cs} index={i} />
              </li>
            ))}
          </ol>
        </div>
        <div className={`container ${styles.progress}`} aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
