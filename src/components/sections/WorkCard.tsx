import Link from "next/link";
import { ViewTransition } from "react";
import type { CaseStudy } from "@/content/types";
import { tagLabels } from "@/content/case-studies";
import { Cover } from "@/components/ui/Cover";
import { Tag } from "@/components/ui/Tag";
import styles from "./WorkCard.module.css";

type Props = {
  cs: CaseStudy;
  index: number;
  priority?: boolean;
};

export function WorkCard({ cs, index, priority }: Props) {
  return (
    <article className={styles.card} data-tags={cs.tags.join(" ")}>
      <Link href={`/work/${cs.slug}`} className={styles.link} transitionTypes={["nav-forward"]} data-cursor="View">
        <ViewTransition name={`cover-${cs.slug}`} share="morph" default="none">
          <div className={styles.media}>
            <Cover image={cs.cover} label={cs.short} index={index} priority={priority} />
          </div>
        </ViewTransition>
        <div className={styles.meta}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.client}>{cs.client}</span>
          <span className={styles.year}>{cs.year}</span>
        </div>
        <h3 className={styles.title}>{cs.title}</h3>
        <p className={styles.summary}>{cs.summary}</p>
        <p className={styles.metric}>
          <span className={styles.metricValue}>{cs.headlineMetric.value}</span>
          <span className={styles.metricLabel}>{cs.headlineMetric.label}</span>
        </p>
      </Link>
      <ul className={styles.tags} aria-label="Capabilities">
        {cs.tags.map((t) => (
          <li key={t}>
            <Tag>{tagLabels[t]}</Tag>
          </li>
        ))}
      </ul>
    </article>
  );
}
