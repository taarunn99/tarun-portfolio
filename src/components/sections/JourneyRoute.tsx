import Link from "next/link";
import { journeyScenes, milestones, waypoints } from "@/content/journey";
import { getImage } from "@/lib/images";
import { Heading } from "@/components/ui/Heading";
import { JourneyStage } from "@/components/scene/journey/JourneyStage";
import { SceneArt } from "@/components/scene/journey/SceneArt";
import type { RouteMilestone, RouteStation, SceneImage } from "@/components/scene/journey/types";
import { formatCoords, geometries, pct, WANDERER_PATH, type Orient, type RouteGeometry } from "@/components/scene/journey/geometry";
import scenes from "@/components/scene/journey/scenes.module.css";
import styles from "./JourneyRoute.module.css";

type Props = {
  /** Compact teaser on the home page vs. the full route on /about */
  variant?: "teaser" | "full";
};

const ORIENTS: Orient[] = ["h", "v"];

/**
 * The journey as a scroll-driven route: three stations (Bhopal, Singapore,
 * Dubai) as framed paintings on one flight path. Everything here is
 * server-rendered in its finished state — route drawn, stations lit, every
 * milestone readable — which is also the reduced-motion and no-JS view.
 * `JourneyStage` (client) only moves what is already on the page.
 */
export function JourneyRoute({ variant = "full" }: Props) {
  const stations: RouteStation[] = waypoints.map((w) => {
    const scene = journeyScenes[w.id];
    return {
      id: w.id,
      city: w.city,
      country: w.country,
      label: w.label,
      from: w.from,
      to: w.to,
      coords: formatCoords(w.lat, w.lng),
      alt: scene.alt,
      image: sceneImage(scene.image),
      layer: sceneImage(scene.layer),
    };
  });

  const all: RouteMilestone[] = [...milestones]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      id: m.id,
      at: m.at,
      kind: m.kind,
      date: m.date,
      dateLabel: formatDate(m.date),
      title: m.title,
      subtitle: m.subtitle,
      summary: m.summary,
      href: m.href,
    }));
  const groups = stations.map((s) => {
    const items = all.filter((m) => m.at === s.id);
    return { station: s, items: variant === "teaser" ? items.slice(0, 2) : items };
  });
  const ordered = groups.flatMap((g) => g.items);
  const steps = ordered.length + 2 * 0.6; // milestones + two flight legs

  return (
    <section
      className={`section ${styles.section}`}
      aria-labelledby="journey-title"
      data-variant={variant}
      style={{ "--steps": steps } as React.CSSProperties}
    >
      <JourneyStage stations={stations} milestones={ordered} allMilestones={all} variant={variant}>
        <div className={styles.stage} data-journey="stage">
          <div className={`container ${styles.inner}`}>
            <header className={styles.head}>
              <div className={styles.headText}>
                <p className="eyebrow">The route</p>
                <Heading as="h2" id="journey-title" className={styles.title} text="Bhopal to Singapore to Dubai." accent="Dubai." />
              </div>
              <div className={styles.headMeta}>
                <p className={styles.counter} aria-hidden="true">
                  <span data-journey="counter">{pad(ordered.length)}</span>
                  <span className={styles.counterSep}>/</span>
                  <span>{pad(ordered.length)}</span>
                </p>
                {variant === "teaser" ? (
                  <Link href="/about" className={styles.more}>
                    The full story
                  </Link>
                ) : null}
              </div>
            </header>

            <div className={styles.viewport} data-journey="viewport">
              <div className={styles.world} data-journey="world">
                {ORIENTS.map((o) => (
                  <RouteSvg key={o} geometry={geometries[o]} stations={stations} />
                ))}
                {stations.map((s) => (
                  <Painting key={s.id} station={s} />
                ))}
              </div>
            </div>

            <ol className={styles.ledger} data-journey="ledger">
              {groups.map(({ station, items }) => (
                <li key={station.id} className={styles.group} data-journey="group" data-id={station.id}>
                  <h3 className={styles.stationName} data-journey="station" data-id={station.id}>
                    <span className={styles.stationCity}>
                      {station.city}
                      <span className={styles.stationCountry}> {station.country}</span>
                    </span>
                    <span className={styles.stationLabel}>{station.label}</span>
                    <span className={styles.stationYears}>{years(station.from, station.to)}</span>
                  </h3>
                  <ol className={styles.cards}>
                    {items.map((m) => (
                      <li key={m.id} className={styles.card} data-journey="card" data-id={m.id} data-at={m.at}>
                        <time className={styles.date} dateTime={m.date}>
                          {m.dateLabel}
                        </time>
                        <p className={styles.cardTitle}>{m.title}</p>
                        {m.subtitle ? <p className={styles.cardSub}>{m.subtitle}</p> : null}
                        {variant === "full" ? <p className={styles.cardSummary}>{m.summary}</p> : null}
                        {m.href ? (
                          <Link href={m.href} className={styles.cardLink}>
                            Case study
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </JourneyStage>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function RouteSvg({ geometry, stations }: { geometry: RouteGeometry; stations: RouteStation[] }) {
  const { viewBox, d, orient, grid } = geometry;
  const last = geometry.stations[geometry.stations.length - 1];
  return (
    <svg
      className={`${styles.svg} ${orient === "h" ? styles.svgH : styles.svgV}`}
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      data-journey="svg"
      data-orient={orient}
      role="img"
      aria-labelledby={`journey-svg-${orient}`}
    >
      <title id={`journey-svg-${orient}`}>Flight route from Bhopal to Singapore to Dubai</title>
      <g className={styles.grid} aria-hidden="true">
        {grid.map((v) =>
          orient === "h" ? (
            <line key={v} x1="0" y1={v} x2={viewBox.w} y2={v} />
          ) : (
            <line key={v} x1={v} y1="0" x2={v} y2={viewBox.h} />
          ),
        )}
      </g>
      <path className={styles.routeBase} d={d} data-journey="route-base" />
      <path className={styles.routeProgress} d={d} data-journey="route" />
      <path className={styles.routeMotion} d={d} data-journey="motion" aria-hidden="true" />
      {geometry.stations.map((s) => {
        const station = stations.find((x) => x.id === s.id);
        return (
          <g key={s.id} className={styles.station} data-journey="dot" data-id={s.id} transform={`translate(${s.x} ${s.y})`}>
            <circle className={styles.stationHalo} r="14" />
            <circle className={styles.stationDot} r="5" />
            <text className={styles.coords} x={s.caption.dx} y={s.caption.dy} textAnchor={s.caption.anchor}>
              {station?.coords}
            </text>
          </g>
        );
      })}
      <g className={styles.marker} data-journey="marker" transform={`translate(${last.x} ${last.y})`} aria-hidden="true">
        <circle className={styles.markerRing} r="11" />
        <circle className={styles.markerDot} r="4" />
        <path className={styles.wanderer} d={WANDERER_PATH} transform="translate(0 -8)" />
      </g>
    </svg>
  );
}

function Painting({ station }: { station: RouteStation }) {
  const h = geometries.h.stations.find((s) => s.id === station.id)!;
  const v = geometries.v.stations.find((s) => s.id === station.id)!;
  const ph = pct(h.painting, geometries.h.viewBox);
  const pv = pct(v.painting, geometries.v.viewBox);
  const style = {
    "--l-h": ph.left,
    "--t-h": ph.top,
    "--w-h": ph.width,
    "--h-h": ph.height,
    "--l-v": pv.left,
    "--t-v": pv.top,
    "--w-v": pv.width,
    "--h-v": pv.height,
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={`${styles.painting} ${scenes.scene}`}
      style={style}
      data-journey="painting"
      data-id={station.id}
      data-scene={station.id}
      data-cursor="Enter"
      aria-label={`Enter the ${station.city} scene`}
    >
      <SceneArt id={station.id} image={station.image} />
      <span className={styles.plate} aria-hidden="true">
        <span className={styles.plateCity}>{station.city}</span>
        <span className={styles.plateYears}>{years(station.from, station.to)}</span>
      </span>
    </button>
  );
}

function sceneImage(id: string): SceneImage | null {
  const entry = getImage(id);
  if (!entry) return null;
  const webp = entry.variants?.webp?.filter((v) => v.w <= 2048).sort((a, b) => b.w - a.w)[0];
  return { src: webp?.src ?? entry.src, width: entry.width, height: entry.height, blurDataURL: entry.blurDataURL };
}

function formatDate(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idx = Number(m) - 1;
  return idx >= 0 && idx < 12 ? `${months[idx]} ${y}` : y;
}

/** "2021 to 2025", "2025 to now" (ongoing) or "2025" (a single year) */
function years(from: string, to?: string): string {
  if (!to) return `${from} to now`;
  return from === to ? from : `${from} to ${to}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
