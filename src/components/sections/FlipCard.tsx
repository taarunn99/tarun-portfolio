import Link from "next/link";
import { ViewTransition } from "react";
import type { CaseStudy } from "@/content/types";
import { tagLabels } from "@/content/case-studies";
import { Cover } from "@/components/ui/Cover";
import { Tag } from "@/components/ui/Tag";
import { FlipToggle } from "./FlipToggle";
import styles from "./FlipCard.module.css";

type Props = {
  cs: CaseStudy;
  index: number;
};

/**
 * A work card that turns over to show its numbers. Front: cover, client,
 * title, capabilities. Back: the headline metric and the case study's
 * sourced metrics. Hover flips it on a mouse, keyboard focus flips it, and
 * on touch screens the "Numbers" button does. Both faces sit inside the one
 * link to the case study, so the whole card stays clickable.
 */
export function FlipCard({ cs, index }: Props) {
  const m = cs.headlineMetric;
  return (
    <article className={styles.card} data-tags={cs.tags.join(" ")}>
      <Link href={`/work/${cs.slug}`} className={styles.link} transitionTypes={["nav-forward"]} data-cursor="View">
        <div className={styles.inner}>
          <div className={styles.front}>
            <ViewTransition name={`cover-${cs.slug}`} share="morph" default="none">
              <div className={styles.media}>
                <Cover image={cs.cover} label={cs.short} index={index} sizes="(min-width: 48rem) 26rem, 80vw" />
              </div>
            </ViewTransition>
            <div className={styles.meta}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.client}>{cs.client}</span>
              <span>{cs.year}</span>
            </div>
            <h3 className={styles.title}>{cs.title}</h3>
            <ul className={styles.tags} aria-label="Capabilities">
              {cs.tags.map((t) => (
                <li key={t}>
                  <Tag>{tagLabels[t]}</Tag>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.back}>
            <p className={styles.backHead}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span> {cs.short}
            </p>
            <p className={styles.hero}>
              <span className={styles.heroValue}>{m.value}</span>
              <span className={styles.heroLabel}>
                {m.label}
                {m.note ? <span className={styles.note}>{m.note}</span> : null}
              </span>
            </p>
            <dl className={styles.metrics}>
              {cs.metrics.slice(0, 4).map((x) => (
                <div key={x.label} className={styles.row}>
                  <dt>{x.label}</dt>
                  <dd>{x.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.more}>Read the case study</p>
          </div>
        </div>
      </Link>
      <FlipToggle name={cs.short} />
    </article>
  );
}
