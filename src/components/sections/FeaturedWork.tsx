import Link from "next/link";
import type { CSSProperties } from "react";
import { featuredCaseStudies } from "@/content/case-studies";
import type { CaseStudy } from "@/content/types";
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
type Props = {
  /** Defaults to the six featured case studies (home). */
  items?: CaseStudy[];
  eyebrow?: string;
  title?: string;
  accent?: string;
  /** Shown as "All work" link; pass null to hide */
  allHref?: string | null;
  id?: string;
};

export function FeaturedWork({
  items = featuredCaseStudies.slice(0, 6),
  eyebrow = "Selected work",
  title = "Products that shipped, with the numbers.",
  accent = "numbers",
  allHref = "/work",
  id = "work-title",
}: Props = {}) {
  return (
    <section
      className={styles.work}
      aria-labelledby={id}
      data-story
      style={{ "--p": 0, "--n": items.length } as CSSProperties}
    >
      <StoryScroll id={id} targets="[data-p]" prop="--wp" />
      <div className={styles.stage}>
        <header className={`container ${styles.head}`}>
          <p className="eyebrow">{eyebrow}</p>
          <Heading as="h2" id={id} className={styles.title} text={title} accent={accent} />
          {allHref ? (
            <Link href={allHref} className={styles.all}>
              All work
            </Link>
          ) : null}
        </header>
        <div className={styles.viewport}>
          <ol className={styles.track} data-p>
            {items.map((cs, i) => (
              <li key={cs.slug} className={styles.item}>
                <FlipCard cs={cs} index={i} />
              </li>
            ))}
          </ol>
        </div>
        <div className={`container ${styles.progress}`} aria-hidden="true">
          <span data-p />
        </div>
      </div>
    </section>
  );
}
