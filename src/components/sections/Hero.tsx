import Link from "next/link";
import { site } from "@/content/site";
import { HeroScene } from "@/components/scene/HeroScene";
import { Magnetic } from "@/components/motion/Magnetic";
import styles from "./Hero.module.css";

/**
 * The LCP element is the positioning line — painted HTML, visible immediately.
 * The entrance is pure CSS (keyframes starting at load), so there is no JS on
 * the critical path and nothing starts at opacity 0 for longer than a frame.
 */
export function Hero() {
  const [before, after] = site.positioning.split(site.accentWord, 2);
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <HeroScene />
      <div className={`container ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{site.role} · {site.location.city}</p>
        <h1 id="hero-title" className={styles.name}>
          <span className={styles.line}>Tarun</span>{" "}
          <span className={styles.line}>Shukla</span>
        </h1>
        <p className={styles.positioning}>
          {before}
          <em className="accent-word">{site.accentWord}</em>
          {after}
        </p>
        <div className={styles.actions}>
          <Magnetic>
            <Link href="/work" className="btn btn-primary" data-cursor="View">
              View work
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/contact" className="btn btn-ghost">
              Get in touch
            </Link>
          </Magnetic>
        </div>
      </div>
      <a href="#proof" className={styles.cue} aria-label="Scroll to results">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
        </svg>
      </a>
    </section>
  );
}
