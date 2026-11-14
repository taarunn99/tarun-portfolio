import type { CSSProperties } from "react";
import { certifications, expertise, strengths, toolGroups } from "@/content/skills";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Skills.module.css";

/**
 * Skills and tools: strengths and expertise side by side, then every tool
 * in one full-width panel, a row per category, logos grey at rest and lit
 * in their brand colour on hover (lit on touch screens), then the
 * certificates.
 */
export function Skills() {
  const total = toolGroups.reduce((n, g) => n + g.tools.length, 0);
  return (
    <section className={`section ${styles.skills}`} aria-labelledby="skills-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">Skills and tools</p>
          <Heading as="h2" id="skills-title" className={styles.title} text="What I bring." accent="bring." />
        </header>

        <Reveal as="div" className={styles.top}>
          <div className={styles.cell}>
            <h3 className={styles.h}>Strengths</h3>
            <ul className={styles.rows}>
              {strengths.map((s) => (
                <li key={s.name}>
                  <b>{s.name}</b>
                  <span>{s.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.cell}>
            <h3 className={styles.h}>Expertise</h3>
            <ul className={styles.list}>
              {expertise.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.h}>Tech and tools</h3>
            <span className={styles.total}>{total} tools</span>
          </div>
          {toolGroups.map((g) => (
            <div key={g.title} className={styles.group}>
              <h4 className={styles.groupTitle}>
                {g.title}
                <span>{g.tools.length}</span>
              </h4>
              <ul className={styles.tools}>
                {g.tools.map((t) => (
                  <li
                    key={t.name}
                    data-glyph={t.glyph ? "" : undefined}
                    style={t.color ? ({ "--c": t.color } as CSSProperties) : undefined}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={t.path} fillRule={t.glyph ? "evenodd" : undefined} />
                    </svg>
                    <span>{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.certs}>
          <h3 className={styles.h}>Certifications</h3>
          <ul className={styles.certList}>
            {certifications.map((c) => (
              <li key={c.title} className={styles.cert}>
                <span className={styles.issuer}>{c.issuer}</span>
                <b>{c.title}</b>
                <span className={styles.certNote}>{c.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
