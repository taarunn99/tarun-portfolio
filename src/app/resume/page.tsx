import type { Metadata } from "next";
import { resume } from "@/content/resume";
import { site } from "@/content/site";
import { Page } from "@/components/sections/Page";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${resume.basics.label}. ${site.location.city}. Download the ATS-friendly PDF or read it here.`,
  alternates: { canonical: "/resume" },
  openGraph: { title: `Résumé | ${site.name}`, url: `${site.url}/resume` },
};

function period(start: string, end: string | null) {
  const f = (ym: string) => {
    const [y, m] = ym.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return m ? `${months[Number(m) - 1]} ${y}` : y;
  };
  return `${f(start)} to ${end ? f(end) : "Present"}`;
}

export default function ResumePage() {
  const r = resume;
  return (
    <Page theme="paper">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Résumé", path: "/resume" }])} />
      <article className={`container ${styles.resume}`}>
        <header className={styles.head}>
          <div>
            <p className="eyebrow">Résumé</p>
            <h1 className={styles.name}>{r.basics.name}</h1>
            <p className={styles.label}>{r.basics.label}</p>
            <p className={styles.meta}>{r.basics.location} · {r.basics.status}</p>
          </div>
          <div className={styles.actions}>
            <a href="/Tarun_Shukla_Resume.pdf" className="btn btn-primary" download>
              Download PDF
            </a>
            <a href="/resume.json" className={styles.alt}>
              JSON
            </a>
          </div>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>Summary</h2>
          <p className={styles.summary}>{r.basics.summary}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Experience</h2>
          {r.work.map((w) => (
            <div key={w.company} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.h3}>{w.company}</h3>
                <span className={styles.when}>{period(w.start, w.end)}</span>
              </div>
              <p className={styles.position}>{w.position} · {w.location}</p>
              <ul className={styles.bullets}>
                {w.highlights.map((h) => (
                  <li key={h.slice(0, 40)}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Projects</h2>
          {r.projects.map((p) => (
            <div key={p.name} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.h3}><a href={p.url} target="_blank" rel="noreferrer">{p.name} ↗</a></h3>
                <span className={styles.when}>{p.period}</span>
              </div>
              <p className={styles.position}>{p.description}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Skills</h2>
          <dl className={styles.skills}>
            {r.skills.map((g) => (
              <div key={g.group}>
                <dt>{g.group}</dt>
                <dd>{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Education</h2>
          {r.education.map((e) => (
            <div key={e.institution} className={styles.entry}>
              <div className={styles.entryHead}>
                <h3 className={styles.h3}>{e.institution}</h3>
                <span className={styles.when}>{e.date}</span>
              </div>
              <p className={styles.position}>{e.area} · {e.location}</p>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Certifications &amp; achievements</h2>
          <ul className={styles.bullets}>
            {r.certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </article>
    </Page>
  );
}
