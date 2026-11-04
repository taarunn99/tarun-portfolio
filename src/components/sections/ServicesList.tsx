import Link from "next/link";
import { services } from "@/content/services";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./ServicesList.module.css";

export function ServicesList() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="services-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">Work with me</p>
          <Heading as="h2" id="services-title" className={styles.title} text="Three things I do for businesses." accent="businesses" />
        </header>
        <Reveal as="ol" className={styles.list} stagger>
          {services.map((s, i) => (
            <li key={s.slug} className={styles.item}>
              <Link href={`/services/${s.slug}`} className={styles.link} transitionTypes={["nav-forward"]} data-cursor="Read">
                <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.body}>
                  <span className={styles.eyebrow}>{s.eyebrow}</span>
                  <span className={styles.itemTitle}>{s.title}</span>
                  <span className={styles.outcome}>{s.outcomes[0]}</span>
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
