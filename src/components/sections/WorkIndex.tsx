"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { CaseStudy, Tag as TagType } from "@/content/types";
import { WorkCard } from "./WorkCard";
import styles from "./WorkIndex.module.css";

type Props = {
  items: CaseStudy[];
  tags: { id: TagType; label: string }[];
};

/**
 * Work index: filter chips (URL `?tag=`) and a grid/list toggle. The full list
 * is server-rendered; filtering only hides cards client-side, so crawlers and
 * no-JS users see everything. The WebGL grid (Phase 5) layers on top on
 * fine-pointer devices; this remains the accessible twin.
 */
/* URL `?tag=` is read as an external store so the server renders the full list
   (no Suspense bailout, no layout shift) and the client syncs after hydration. */
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
  };
}
function getTag(): string | null {
  return new URLSearchParams(window.location.search).get("tag");
}
function setUrlTag(tag: string | null) {
  const url = new URL(window.location.href);
  if (tag) url.searchParams.set("tag", tag);
  else url.searchParams.delete("tag");
  window.history.replaceState(window.history.state, "", url);
  listeners.forEach((l) => l());
}

export function WorkIndex({ items, tags }: Props) {
  const active = useSyncExternalStore(subscribe, getTag, () => null) as TagType | null;
  const [view, setView] = useState<"grid" | "list">("grid");

  const visible = useMemo(() => (active ? items.filter((i) => i.tags.includes(active)) : items), [items, active]);

  const setTag = (tag: TagType | null) => setUrlTag(tag);

  return (
    <div className={styles.index}>
      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="Filter by capability">
          <button type="button" className={styles.chip} aria-pressed={active === null} onClick={() => setTag(null)}>
            All
            <span className={styles.count}>{items.length}</span>
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              className={styles.chip}
              aria-pressed={active === t.id}
              onClick={() => setTag(active === t.id ? null : t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.toggle} role="group" aria-label="View">
          <button type="button" className={styles.toggleBtn} aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
            <span className="sr-only">Grid view</span>
          </button>
          <button type="button" className={styles.toggleBtn} aria-pressed={view === "list"} onClick={() => setView("list")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>
            <span className="sr-only">List view</span>
          </button>
        </div>
      </div>

      <p className={styles.status} aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
        {active ? ` · ${tags.find((t) => t.id === active)?.label ?? active}` : ""}
      </p>

      {view === "grid" ? (
        <div className={styles.grid}>
          {items.map((cs, i) => (
            <div key={cs.slug} hidden={!visible.includes(cs)}>
              <WorkCard cs={cs} index={i} priority={i === 0} />
            </div>
          ))}
        </div>
      ) : (
        <ol className={styles.list}>
          {items.map((cs, i) => (
            <li key={cs.slug} hidden={!visible.includes(cs)} className={styles.row}>
              <Link href={`/work/${cs.slug}`} className={styles.rowLink} transitionTypes={["nav-forward"]}>
                <span className={styles.rowIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.rowTitle}>{cs.title}</span>
                <span className={styles.rowClient}>{cs.client}</span>
                <span className={styles.rowMetric}>{cs.headlineMetric.value}</span>
                <span className={styles.rowYear}>{cs.year}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
