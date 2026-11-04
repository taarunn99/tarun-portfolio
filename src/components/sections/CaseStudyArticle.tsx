import Link from "next/link";
import { ViewTransition } from "react";
import type { CaseStudy } from "@/content/types";
import { caseStudies, tagLabels } from "@/content/case-studies";
import { services } from "@/content/services";
import { Cover } from "@/components/ui/Cover";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { Numeral } from "@/components/ui/Numeral";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/motion/Reveal";
import { WorkCard } from "./WorkCard";
import styles from "./CaseStudyArticle.module.css";

const sectionTitles: Record<keyof Omit<CaseStudy["sections"], "stack">, string> = {
  context: "Context",
  constraint: "Constraint",
  approach: "What I did",
  result: "Result",
  retrospective: "What I'd change",
};

export function CaseStudyArticle({ cs }: { cs: CaseStudy }) {
  const index = caseStudies.findIndex((c) => c.slug === cs.slug);
  const related = caseStudies.filter((c) => c.slug !== cs.slug && c.tags.some((t) => cs.tags.includes(t))).slice(0, 2);
  const service = services.find((s) => cs.services.includes(s.slug));

  return (
    <article className={styles.article}>
      <header className={`container ${styles.header}`}>
        <Link href="/work" className={styles.back} transitionTypes={["nav-back"]}>
          ← Work
        </Link>
        <p className="eyebrow">{cs.client}</p>
        <h1 className={styles.title}>{cs.title}</h1>
        <p className={styles.summary}>{cs.summary}</p>
        <dl className={styles.meta}>
          <div><dt>Role</dt><dd>{cs.role}</dd></div>
          <div><dt>Period</dt><dd>{cs.period}</dd></div>
          <div><dt>Stack</dt><dd>{cs.sections.stack.slice(0, 4).join(" · ")}</dd></div>
          {cs.links.live ? (
            <div><dt>Live</dt><dd><a href={cs.links.live} target="_blank" rel="noreferrer">{cs.links.live.replace(/^https?:\/\//, "")} ↗</a></dd></div>
          ) : null}
          {cs.links.repo ? (
            <div><dt>Code</dt><dd><a href={cs.links.repo} target="_blank" rel="noreferrer">GitHub ↗</a></dd></div>
          ) : null}
        </dl>
      </header>

      <div className={`container ${styles.hero}`}>
        <ViewTransition name={`cover-${cs.slug}`} share="morph" default="none">
          <BrowserFrame url={cs.links.live}>
            <Cover image={cs.cover} label={cs.short} index={index} sizes="(min-width: 96rem) 96rem, 100vw" priority />
          </BrowserFrame>
        </ViewTransition>
      </div>

      <Reveal as="ul" className={`container ${styles.metrics}`} stagger>
        <li className={styles.headline}>
          <Numeral metric={cs.headlineMetric} size="lg" />
        </li>
        {cs.metrics.slice(0, 4).map((m) => (
          <li key={m.label}>
            <Numeral metric={m} size="sm" />
          </li>
        ))}
      </Reveal>

      <div className={`container ${styles.body}`}>
        {(Object.keys(sectionTitles) as (keyof typeof sectionTitles)[]).map((key, i) => (
          <Reveal key={key} as="section" className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIndex}>{String(i + 1).padStart(2, "0")}</span>
              {sectionTitles[key]}
            </h2>
            <p className={styles.prose}>{cs.sections[key]}</p>
          </Reveal>
        ))}
        <Reveal as="section" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIndex}>06</span>
            Stack
          </h2>
          <ul className={styles.stack}>
            {cs.sections.stack.map((s) => (
              <li key={s}><Tag>{s}</Tag></li>
            ))}
          </ul>
        </Reveal>
        {cs.gallery.length > 0 ? (
          <Reveal as="section" className={styles.gallery} stagger>
            {cs.gallery.map((g, i) => (
              <BrowserFrame key={g.id}>
                <Cover image={g} label={g.alt} index={index + i + 1} sizes="(min-width: 64rem) 48rem, 100vw" />
              </BrowserFrame>
            ))}
          </Reveal>
        ) : null}
        <aside className={styles.aside}>
          <p className="eyebrow">Capabilities</p>
          <ul className={styles.tags}>
            {cs.tags.map((t) => (
              <li key={t}><Link href={`/work?tag=${t}`}><Tag>{tagLabels[t]}</Tag></Link></li>
            ))}
          </ul>
          {service ? (
            <p className={styles.serviceLink}>
              Part of <Link href={`/services/${service.slug}`}>{service.eyebrow}: {service.title}</Link>
            </p>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className={`container ${styles.related}`} aria-labelledby="related-title">
          <p className="eyebrow">Related work</p>
          <h2 id="related-title" className={styles.relatedTitle}>More of the same kind</h2>
          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <WorkCard key={r.slug} cs={r} index={caseStudies.findIndex((c) => c.slug === r.slug)} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
