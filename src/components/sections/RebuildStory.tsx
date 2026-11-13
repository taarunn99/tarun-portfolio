import type { CSSProperties } from "react";
import { Heading } from "@/components/ui/Heading";
import { StoryScroll } from "@/components/motion/StoryScroll";
import { RebuildScene } from "@/components/scene/rebuild/RebuildScene";
import styles from "./RebuildStory.module.css";

/** Caption windows on the story progress (start, end). Numbers from src/content/services.ts. */
const CAPTIONS: Array<[number, number, string]> = [
  [-1, 0.12, "The old lapizblue.com: about 1,200 pages nobody asked for."],
  [0.14, 0.46, "Every old URL mapped, then the clutter comes apart."],
  [0.52, 0.8, "Rebuilt as 62 pages in Next.js."],
  [0.84, 2, "Lighthouse 66 to 99, and 1,342 clicks in the first three months."],
];

/**
 * The Web service's set piece: a pinned scroll in which the old site, as a
 * mosaic of 1,200 tiles inside a browser frame, shudders, blows apart into
 * a storm and rebuilds itself as 62 clean blocks while a score dial climbs
 * from 66 to 99. The tiles are WebGL (scene/rebuild); the frame, captions,
 * page counter and dial are HTML on `--p`, so the story reads without the
 * canvas and under reduced motion.
 */
export function RebuildStory() {
  return (
    <section className={styles.story} aria-labelledby="rebuild-title" data-story style={{ "--p": 0 } as CSSProperties}>
      <StoryScroll id="rebuild-title" />
      <div className={styles.stage}>
        <header className={`container ${styles.head}`}>
          <p className="eyebrow">The rebuild</p>
          <Heading as="h2" id="rebuild-title" className={styles.title} text="Watch the old site come apart." accent="apart." />
        </header>

        <div className={styles.frame}>
          <div className={styles.bar} aria-hidden="true">
            <i />
            <i />
            <i />
            <span>lapizblue.com</span>
          </div>
          <div className={styles.page} data-page />
        </div>

        <RebuildScene />

        <div className={`container ${styles.foot}`}>
          <ol className={styles.captions}>
            {CAPTIONS.map(([a, b, text]) => (
              <li key={text} className={styles.caption} style={{ "--a": a, "--b": b } as CSSProperties}>
                {text}
              </li>
            ))}
          </ol>

          <div className={styles.meters} aria-hidden="true">
            <div className={styles.meter}>
              <span className={styles.label}>Pages</span>
              <span className={styles.count}>
                <span className={styles.before}>1,200</span>
                <span className={styles.after}>62</span>
              </span>
            </div>
            <div className={styles.dial}>
              <svg viewBox="0 0 64 64" className={styles.ring}>
                <circle cx="32" cy="32" r="28" pathLength="100" className={styles.track} />
                <circle cx="32" cy="32" r="28" pathLength="100" className={styles.arc} />
              </svg>
              <span className={styles.score} />
              <span className={styles.label}>Lighthouse</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
