import { cacheLife } from "next/cache";
import { Header } from "@/components/Header";
import { HeroScene } from "@/components/scene/HeroScene";
import { projects, site } from "@/lib/site";
import styles from "./page.module.css";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main" className={styles.main}>
        {/* ---------------------------------------------------------- Hero */}
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <HeroScene />
          <div className={`container ${styles.heroInner}`}>
            <p className="eyebrow">{site.role}</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              {site.name}
            </h1>
            <p className={styles.heroTagline}>{site.tagline}</p>
            <div className={styles.heroActions}>
              <a href="#work" className="btn btn-primary">
                View work
              </a>
              <a href="#contact" className="btn btn-ghost">
                Get in touch
              </a>
            </div>
          </div>
          <a href="#work" className={styles.scrollCue}>
            <span className="sr-only">Scroll to work</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
            </svg>
          </a>
        </section>

        {/* ---------------------------------------------------------- Work */}
        <section id="work" className={`section ${styles.work}`} aria-labelledby="work-title">
          <div className="container">
            <header className={styles.sectionHead}>
              <p className="eyebrow">Selected work</p>
              <h2 id="work-title" className={styles.sectionTitle}>
                Projects that shipped.
              </h2>
            </header>

            <ul className={styles.grid}>
              {projects.map((project, index) => (
                <li key={project.slug}>
                  <article className={styles.card}>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    <p className={styles.cardBody}>{project.description}</p>
                    <ul className={styles.tags} aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li key={tag} className={styles.tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------------------------------- About */}
        <section id="about" className={`section ${styles.about}`} aria-labelledby="about-title">
          <div className={`container ${styles.aboutInner}`}>
            <header className={styles.sectionHead}>
              <p className="eyebrow">About</p>
              <h2 id="about-title" className={styles.sectionTitle}>
                Performance is a feature.
              </h2>
            </header>
            <div className={styles.aboutBody}>
              <p>
                {/* TODO: replace with your story */}
                I build interfaces that feel instant and look considered — from
                the first byte to the last frame. Every project here was shipped
                with real users, real constraints and real metrics.
              </p>
              <p>
                This site is a working example: server-rendered content,
                self-hosted fonts, a WebGL scene that only loads after the page
                is interactive, and smooth scrolling that steps aside for users
                who prefer reduced motion.
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Stack</dt>
                  <dd>Next.js · TypeScript · Three.js</dd>
                </div>
                <div>
                  <dt>Focus</dt>
                  <dd>Web performance · Motion · Accessibility</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Open to select projects</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- Contact */}
        <section id="contact" className={`section ${styles.contact}`} aria-labelledby="contact-title">
          <div className="container">
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title" className={styles.contactTitle}>
              Let&apos;s build something fast.
            </h2>
            <a href={`mailto:${site.email}`} className={styles.contactLink}>
              {site.email}
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <p>
            © <CopyrightYear /> {site.name}
          </p>
          {site.socials.length > 0 ? (
            <ul className={styles.socials} aria-label="Social links">
              {site.socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} rel="me noreferrer" target="_blank">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </footer>
    </>
  );
}
