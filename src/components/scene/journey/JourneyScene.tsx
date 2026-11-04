"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { loadMotion, prefersReducedMotion } from "@/components/motion/runtime";
import { SceneArt } from "./SceneArt";
import type { RouteMilestone, RouteStation } from "./types";
import scenes from "./scenes.module.css";
import styles from "./JourneyScene.module.css";

const DioramaCanvas = dynamic(() => import("./DioramaCanvas"), { ssr: false });

type Props = {
  station: RouteStation;
  milestones: RouteMilestone[];
  /** The painting's rect at click time — the frame expands from here */
  from: DOMRect;
  /** The painting button; focus returns to it on close */
  trigger: HTMLElement;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * "Enter the scene". A modal frame grows out of the clicked painting
 * (0.9 s expo.inOut), then the diorama mounts inside it. Fine pointers
 * without reduced motion get the WebGL diorama; everyone else (and any
 * WebGL failure) gets the same milestones as a plain list over the painting.
 * Focus is trapped, Esc and the close button exit, body scroll is locked.
 */
export function JourneyScene({ station, milestones, from, trigger, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"3d" | "list">(() =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion() ? "3d" : "list",
  );
  const closing = useRef(false);

  // Open: lock scroll, expand the frame from the painting, trap focus.
  useEffect(() => {
    const frame = frameRef.current;
    const overlay = overlayRef.current;
    if (!frame || !overlay) return;
    let cancelled = false;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    let tween: { kill: () => void } | null = null;
    void loadMotion().then((m) => {
      if (cancelled) return;
      m?.lenis?.stop();
      if (!m) {
        setOpen(true);
        return;
      }
      const { gsap } = m;
      gsap.set(frame, { top: from.top, left: from.left, width: from.width, height: from.height, borderRadius: 4 });
      gsap.fromTo(overlay, { "--scrim": 0 }, { "--scrim": 1, duration: 0.6, ease: "power2.out" });
      tween = gsap.to(frame, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.9,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(frame, { clearProps: "top,left,width,height,borderRadius" });
          setOpen(true);
        },
      });
    });

    return () => {
      cancelled = true;
      tween?.kill();
      html.style.overflow = prevOverflow;
      void loadMotion().then((m) => m?.lenis?.start());
      trigger.focus({ preventScroll: true });
    };
  }, [from, trigger]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setReady(false);
    setOpen(false);
    const frame = frameRef.current;
    const overlay = overlayRef.current;
    void loadMotion().then((m) => {
      if (!m || !frame || !overlay) {
        onClose();
        return;
      }
      const r = trigger.getBoundingClientRect();
      const { gsap } = m;
      gsap.to(overlay, { "--scrim": 0, duration: 0.6, ease: "power2.inOut" });
      gsap.to(frame, {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        borderRadius: 4,
        duration: 0.9,
        ease: "expo.inOut",
        onComplete: onClose,
      });
    });
  }, [onClose, trigger]);

  // Esc anywhere while open.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const items = Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${station.city} scene`}
      onKeyDown={trap}
      data-lenis-prevent
    >
      <div ref={frameRef} className={`${styles.frame} ${scenes.scene}`} data-scene={station.id} data-open={open ? "true" : "false"}>
        <div className={styles.poster} aria-hidden="true">
          {/* The frame starts at the painting's size and grows to the viewport; sizes describes the end state. */}
          <SceneArt id={station.id} image={station.image} sizes="(min-width: 0px) 100vw" />
        </div>

        <div className={styles.content} data-ready={ready ? "true" : "false"}>
          {open && mode === "3d" ? (
            <DioramaCanvas
              station={station}
              milestones={milestones}
              paletteEl={frameRef}
              onFallback={() => setMode("list")}
              onReady={() => setReady(true)}
            />
          ) : null}
          {open && mode === "list" ? <MilestoneList milestones={milestones} onMounted={() => setReady(true)} /> : null}
        </div>

        <header className={styles.bar}>
          <p className={styles.barTitle}>
            <span className={styles.barCity}>{station.city}</span>
            <span className={styles.barLabel}>{station.label}</span>
          </p>
          <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label="Close scene">
            Close
            <kbd className={styles.kbd} aria-hidden="true">
              Esc
            </kbd>
          </button>
        </header>
      </div>
    </div>
  );
}

function MilestoneList({ milestones, onMounted }: { milestones: RouteMilestone[]; onMounted: () => void }) {
  useEffect(() => {
    onMounted();
  }, [onMounted]);
  return (
    <div className={styles.listWrap}>
      <ol className={styles.list}>
        {milestones.map((m) => (
          <li key={m.id} className={styles.listCard}>
            <time className={styles.cardDate} dateTime={m.date}>
              {m.dateLabel}
            </time>
            <p className={styles.cardTitle}>{m.title}</p>
            {m.subtitle ? <p className={styles.cardSub}>{m.subtitle}</p> : null}
            <p className={styles.cardSummary}>{m.summary}</p>
            {m.href ? (
              <Link href={m.href} className={styles.cardLink}>
                Case study
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
