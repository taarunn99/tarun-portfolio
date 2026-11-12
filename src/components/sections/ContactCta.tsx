import Link from "next/link";
import { site } from "@/content/site";
import { Heading } from "@/components/ui/Heading";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitLines } from "@/components/motion/SplitLines";
import { BandLight } from "@/components/motion/BandLight";
import { LocalTime } from "@/components/motion/LocalTime";
import styles from "./ContactCta.module.css";

const linkedin = site.socials.find((s) => s.label === "LinkedIn");

/**
 * The contact band. A slim dark panel with the curve of a planet along its
 * bottom edge (the horizon the globe journey ends on). A thin cyan light
 * runs along that rim and turns to face the pointer; a faint dot grid wakes
 * up around it. Everything visual is CSS on variables that BandLight eases;
 * without a mouse the light rests in place.
 */
export function ContactCta() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="cta-title">
      <div className="container">
        <div className={styles.band}>
          <BandLight />
          <div className={styles.grid} aria-hidden="true" />
          <div className={styles.spot} aria-hidden="true" />
          <div className={styles.horizon} aria-hidden="true">
            <div className={styles.planet} />
            <div className={styles.rim} data-rim>
              <div className={styles.rimLight} />
            </div>
          </div>

          <div className={styles.copy}>
            <p className="eyebrow">Contact</p>
            <SplitLines as="h2" className={styles.title}>
              <Heading as="span" text="Let's build something fast." accent="fast." />
            </SplitLines>
            <p id="cta-title" className="sr-only">
              Let&apos;s build something fast.
            </p>
            <p className={styles.lead}>Roles, consulting, or a second opinion on a stack. One message is enough.</p>
          </div>

          <div className={styles.actions}>
            <a className={styles.mail} href={`mailto:${site.email}?subject=Hello%20Tarun`}>
              {site.email}
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
            <div className={styles.buttons}>
              <Magnetic>
                <Link href="/contact" className="btn btn-primary">
                  Start a conversation
                </Link>
              </Magnetic>
              {linkedin ? (
                <a href={linkedin.href} className="btn btn-ghost" rel="me noopener" target="_blank">
                  LinkedIn
                </a>
              ) : null}
            </div>
            <LocalTime className={styles.time} />
          </div>
        </div>
      </div>
    </section>
  );
}
