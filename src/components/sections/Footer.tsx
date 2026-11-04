import Link from "next/link";
import { cacheLife } from "next/cache";
import { site } from "@/content/site";
import styles from "./Footer.module.css";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.col}>
          <p className={styles.name}>{site.name}</p>
          <p className={styles.meta}>
            {site.role} · {site.location.city}, {site.location.countryCode}
          </p>
        </div>
        <ul className={styles.links} aria-label="Site">
          <li><Link href="/work">Work</Link></li>
          <li><Link href="/services/nextjs-development-dubai">Services</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/resume">Résumé</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <ul className={styles.links} aria-label="Elsewhere">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="me noreferrer" target="_blank">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.copy}>
          © <Year /> {site.name}. Built with Next.js, GSAP and Three.js. Lighthouse 100 on every page.
        </p>
      </div>
    </footer>
  );
}
