import Link from "next/link";
import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { capabilities } from "@/content/capabilities";
import { waypoints } from "@/content/journey";
import { HeroScene } from "@/components/scene/HeroScene";
import { Magnetic } from "@/components/motion/Magnetic";
import { StoryScroll } from "@/components/motion/StoryScroll";
import styles from "./Hero.module.css";

/**
 * Each caption names a layer of the website that peels off the laptop screen
 * (top of the stack first) and the capability it stands for.
 * `in` is the scroll progress where it appears beside its part on wide
 * screens (matches the part's separation in scene/laptop/choreography);
 * `inN`/`outN` are its turn in the single caption slot on narrow screens.
 */
const LAYERS = [
  { anchor: "web", part: "Interface", capability: "web", side: "left", in: 0.2, inN: 0.15, outN: 0.22 },
  { anchor: "brand", part: "Brand", capability: "brand", side: "right", in: 0.245, inN: 0.22, outN: 0.29 },
  { anchor: "growth", part: "Growth", capability: "growth", side: "left", in: 0.29, inN: 0.29, outN: 0.36 },
  { anchor: "ai", part: "Automation", capability: "ai", side: "right", in: 0.335, inN: 0.36, outN: 0.43 },
  { anchor: "erp", part: "Data", capability: "erp", side: "left", in: 0.38, inN: 0.43, outN: 0.5 },
  { anchor: "ops", part: "Infrastructure", capability: "ops", side: "right", in: 0.425, inN: 0.5, outN: 0.56 },
] as const;

/** Wide-screen captions all leave together as the laptop snaps shut. */
const CAPTIONS_OUT = 0.57;

/**
 * The hero is a pinned scroll story. At rest: name and positioning (the LCP,
 * painted HTML) beside a laptop that opens on arrival, a live Earth as its
 * wallpaper. Scrolling springs the laptop up and peels the website off its
 * screen into six stacked layers (interface down to infrastructure) while it
 * turns once, each layer's capability beside it; the layers fly back into the
 * screen, the camera dives in and the globe flies the route
 * Bhopal, Singapore, Dubai. `--p` (0 to 1) drives the copy and captions in
 * CSS; the 3D scene (scene/laptop) reads the same progress.
 *
 * Reduced motion: no pin, no scene; the captions become a plain grid.
 */
export function Hero() {
  const [before, after] = site.positioning.split(site.accentWord, 2);
  const byId = new Map(capabilities.map((c) => [c.id, c]));

  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-story style={{ "--p": 0 } as CSSProperties}>
      <StoryScroll id="hero-title" />
      <div className={styles.stage}>
        {/* Static aurora: paints instantly, and is the fallback when the animated sky can't run */}
        <div className={styles.sky} aria-hidden="true">
          <div className={`${styles.curtain} ${styles.curtainA}`} />
          <div className={`${styles.curtain} ${styles.curtainB}`} />
        </div>
        <HeroScene laptop />

        <div className={`container ${styles.inner}`}>
          <p className={`eyebrow ${styles.eyebrow}`}>
            {site.role} · {site.location.city}
          </p>
          <h1 id="hero-title" className={styles.name}>
            <span className={styles.line}>Tarun</span> <span className={styles.line}>Shukla</span>
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

        <div className={styles.inside}>
          <p className="eyebrow">What&apos;s inside</p>
          <h2 className={styles.insideTitle}>
            Every <em className="accent-word">layer</em>, built in-house
          </h2>
        </div>

        <ol className={styles.caps}>
          {LAYERS.map((layer, i) => {
            const cap = byId.get(layer.capability);
            if (!cap) return null;
            const vars = {
              "--in": layer.in,
              "--out": CAPTIONS_OUT,
              "--in-n": layer.inN,
              "--out-n": layer.outN,
              "--slot": i,
            } as CSSProperties;
            return (
              <li key={layer.anchor} className={styles.cap} data-anchor={layer.anchor} data-side={layer.side} style={vars}>
                <p className={styles.part}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> {layer.part}
                </p>
                <h3 className={styles.capTitle}>{cap.title}</h3>
                <p className={styles.blurb}>{cap.blurb}</p>
                {cap.stat ? (
                  <p className={styles.stat}>
                    <span>{cap.stat.value}</span> {cap.stat.label}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className={styles.route}>
          <p className="eyebrow">The route</p>
          <h2 className={styles.insideTitle}>
            From Bhopal to <em className="accent-word">Dubai</em>
          </h2>
        </div>

        <ol className={styles.stops} aria-label="Journey">
          {waypoints.map((w, i) => (
            <li key={w.id} className={styles.stop} data-stop={w.id} style={{ "--slot": i } as CSSProperties}>
              <p className={styles.stopCity}>
                {w.city}
                {w.country !== w.city ? <span>, {w.country}</span> : null}
              </p>
              <p className={styles.stopWhen}>{w.to && w.to !== w.from ? `${w.from} to ${w.to}` : w.to ? w.from : `${w.from} to now`}</p>
              <p className={styles.stopWhat}>{w.label}</p>
            </li>
          ))}
        </ol>

        <a href="#proof" className={styles.cue} aria-label="Skip to results">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
