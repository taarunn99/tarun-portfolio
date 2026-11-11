import Link from "next/link";
import { services } from "@/content/services";
import styles from "./ServicesList.module.css";

/**
 * Services on a solid Midnight Grid panel, the one break from the aurora
 * backdrop. As the section scrolls in, the panel opens from an inset card to
 * the full screen (and closes again on the way out), and each line of text
 * fills from faint to full as it passes up the screen. All of it is CSS
 * scroll-driven animation, so there is no JS; browsers without
 * `animation-timeline` and reduced motion get the solid panel with the text
 * already filled.
 */
export function ServicesList() {
  return (
    <section className={styles.section} aria-labelledby="services-title">
      <div className={`container ${styles.inner}`}>
        <header className={styles.head}>
          <p className="eyebrow">Work with me</p>
          <h2 id="services-title" className={styles.title}>
            <span className={styles.fill}>
              Three things I do for <em className="accent-word">businesses</em>.
            </span>
          </h2>
        </header>
        <ol className={styles.list}>
          {services.map((s, i) => (
            <li key={s.slug} className={styles.item}>
              <Link href={`/services/${s.slug}`} className={styles.link} transitionTypes={["nav-forward"]} data-cursor="Read">
                <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.body}>
                  <span className={styles.eyebrow}>{s.eyebrow}</span>
                  <span className={styles.itemTitle}>
                    <span className={styles.fill}>{s.title}</span>
                  </span>
                  <span className={styles.outcome}>
                    <span className={`${styles.fill} ${styles.late}`}>{s.outcomes[0]}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
