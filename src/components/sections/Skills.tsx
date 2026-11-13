import type { CSSProperties } from "react";
import { expertise, strengths, tools } from "@/content/skills";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Skills.module.css";

/**
 * Skills and tools: strengths, expertise and a grid of tool logos that sit
 * grey and light up in their brand colour on hover (always lit on touch).
 */
export function Skills() {
  return (
    <section className={`section ${styles.skills}`} aria-labelledby="skills-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">Skills and tools</p>
          <Heading as="h2" id="skills-title" className={styles.title} text="What I bring." accent="bring." />
        </header>

        <Reveal as="div" className={styles.grid}>
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

          <div className={styles.cell}>
            <h3 className={styles.h}>Tech and tools</h3>
            <ul className={styles.tools}>
              {tools.map((t) => (
                <li key={t.name} style={t.color ? ({ "--c": t.color } as CSSProperties) : undefined}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={t.path} />
                  </svg>
                  <span>{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
