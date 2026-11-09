import Link from "next/link";
import { milestones, waypoints } from "@/content/journey";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./JourneyList.module.css";

type Props = {
  /** Compact teaser on the home page vs. full list on /about */
  variant?: "teaser" | "full";
};

/**
 * The journey as an ordered list grouped by city. This is the SSR'd,
 * accessible twin of the animated route (Phase 5) and the reduced-motion view.
 */
export function JourneyList({ variant = "full" }: Props) {
  const groups = waypoints.map((w) => ({
    waypoint: w,
    items: milestones.filter((m) => m.at === w.id).sort((a, b) => a.date.localeCompare(b.date)),
  }));
  const visible = variant === "teaser" ? groups.map((g) => ({ ...g, items: g.items.slice(0, 2) })) : groups;

  return (
    <section className={`section ${styles.section}`} aria-labelledby="journey-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">The route</p>
          <Heading as="h2" id="journey-title" className={styles.title} text="Bhopal to Singapore to Dubai." accent="Dubai" />
          {variant === "teaser" ? (
            <Link href="/about" className={styles.more}>
              The full story
            </Link>
          ) : null}
        </header>
        <Reveal as="ol" className={styles.route} stagger>
          {visible.map(({ waypoint, items }) => (
            <li key={waypoint.id} className={styles.stop}>
              <div className={styles.stopHead}>
                <span className={styles.dot} aria-hidden="true" />
                <h3 className={styles.city}>
                  {waypoint.city}
                  <span className={styles.country}> {waypoint.country}</span>
                </h3>
                <span className={styles.years}>
                  {waypoint.from}
                  {waypoint.to ? ` to ${waypoint.to}` : " to now"}
                </span>
              </div>
              <ol className={styles.milestones}>
                {items.map((m) => (
                  <li key={m.id} className={styles.milestone}>
                    <time className={styles.date} dateTime={m.date}>
                      {formatDate(m.date)}
                    </time>
                    <div>
                      <p className={styles.mTitle}>
                        {m.href ? <Link href={m.href}>{m.title}</Link> : m.title}
                      </p>
                      {m.subtitle ? <p className={styles.mSub}>{m.subtitle}</p> : null}
                      {variant === "full" ? <p className={styles.mSummary}>{m.summary}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function formatDate(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = Number(m) - 1;
  return idx >= 0 && idx < 12 ? `${months[idx]} ${y}` : y;
}
