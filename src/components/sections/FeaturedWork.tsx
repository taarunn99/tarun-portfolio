import Link from "next/link";
import { featuredCaseStudies } from "@/content/case-studies";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import { WorkCard } from "./WorkCard";
import styles from "./FeaturedWork.module.css";

export function FeaturedWork() {
  const items = featuredCaseStudies.slice(0, 6);
  return (
    <section className={`section ${styles.section}`} aria-labelledby="work-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">Selected work</p>
          <Heading as="h2" id="work-title" className={styles.title} text="Products that shipped, with the numbers." accent="numbers" />
          <Link href="/work" className={styles.all}>
            All work
          </Link>
        </header>
        <Reveal as="div" className={styles.grid} stagger>
          {items.map((cs, i) => (
            <WorkCard key={cs.slug} cs={cs} index={i} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
