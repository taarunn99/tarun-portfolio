import Link from "next/link";
import { site } from "@/content/site";
import styles from "./Header.module.css";

const links = [
  { href: "/work", label: "Work" },
  { href: "/services/nextjs-development-dubai", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.brand}>
          <span aria-hidden="true">TS</span>
          <span className="sr-only">{site.name}, home</span>
        </Link>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
