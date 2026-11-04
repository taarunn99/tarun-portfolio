import { site } from "@/lib/site";
import styles from "./Header.module.css";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <a href="#top" className={styles.brand}>
          <span aria-hidden="true">TS</span>
          <span className="sr-only">{site.name} — back to top</span>
        </a>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
