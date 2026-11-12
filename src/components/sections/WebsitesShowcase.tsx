import Link from "next/link";
import type { CSSProperties } from "react";
import { websites } from "@/content/websites";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { Cover } from "@/components/ui/Cover";
import styles from "./WebsitesShowcase.module.css";

/**
 * Client websites as a deck: on wide screens each card pins below the one
 * before it and the next slides up over it. Each card: the live site in a
 * browser frame with its inner pages fanned out behind (they spread on
 * hover), what the site is, who it is for, and what it is built with. No
 * metrics on purpose; the case studies carry those.
 */
export function WebsitesShowcase() {
  const total = String(websites.length).padStart(2, "0");
  return (
    <section className={styles.sites} aria-labelledby="sites-title">
      <header className={`container ${styles.head}`}>
        <p className="eyebrow">Websites</p>
        <h2 id="sites-title" className={styles.title}>
          Sites I designed and <em className="accent-word">built</em>
        </h2>
        <p className={styles.lead}>Client websites, live today. Open any of them and click around.</p>
      </header>

      <ol className={`container ${styles.deck}`}>
        {websites.map((w, i) => {
          const [main, ...rest] = w.screens;
          if (!main) return null;
          return (
            <li key={w.id} className={styles.slot} style={{ "--i": i } as CSSProperties}>
              <article className={styles.card} aria-labelledby={`site-${w.id}`}>
                <div className={styles.shots}>
                  {rest.slice(0, 2).map((s, k) => (
                    <div key={s.id} className={styles.back} data-k={k} aria-hidden="true">
                      <Cover image={s} label={w.domain} index={i} sizes="(min-width: 60rem) 30vw, 70vw" />
                    </div>
                  ))}
                  <BrowserFrame url={w.domain} className={styles.main}>
                    <Cover image={main} label={w.domain} index={i} sizes="(min-width: 60rem) 46vw, 92vw" />
                  </BrowserFrame>
                </div>

                <div className={styles.info}>
                  <p className={styles.kicker}>
                    <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span> / {total} · {w.year}
                  </p>
                  <h3 id={`site-${w.id}`} className={styles.domain}>
                    {w.domain}
                  </h3>
                  <p className={styles.client}>{w.client}</p>
                  <p className={styles.about}>{w.about}</p>
                  <div className={styles.built}>
                    <p className={styles.label}>Built with</p>
                    <ul className={styles.stack}>
                      {w.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.links}>
                    <a href={w.url} className="btn btn-primary" target="_blank" rel="noopener">
                      Visit site
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17 17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    {w.caseStudy ? (
                      <Link href={`/work/${w.caseStudy}`} className="btn btn-ghost" transitionTypes={["nav-forward"]}>
                        How it was built
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
