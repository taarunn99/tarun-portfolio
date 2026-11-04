"use client";

import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useMotion } from "@/components/motion/useMotion";
import { JourneyScene } from "./JourneyScene";
import { mountRoute, type RouteHandle } from "./routeTimeline";
import type { RouteMilestone, RouteStation } from "./types";

type Props = {
  stations: RouteStation[];
  /** Milestones shown on the route (teaser: two per city) */
  milestones: RouteMilestone[];
  /** Every milestone, for the scene (always the full set) */
  allMilestones: RouteMilestone[];
  variant: "teaser" | "full";
  children: ReactNode;
};

type Entered = { station: RouteStation; from: DOMRect; trigger: HTMLElement };

/**
 * Client shell around the server-rendered route. Attaches the scroll timeline
 * once the motion runtime is ready and opens the scene when a painting is
 * clicked. Until then everything is plain, readable HTML.
 */
export function JourneyStage({ stations, milestones, allMilestones, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState<Entered | null>(null);

  useMotion(
    (m) => {
      const root = ref.current;
      if (!root) return;
      let handle: RouteHandle | null = null;
      let cancelled = false;
      let arm: (() => void) | null = null;

      const start = () => {
        void mountRoute(root, m, milestones, () => cancelled).then((h) => {
          if (cancelled) h?.destroy();
          else handle = h;
        });
      };

      // Switching to the tall/sticky layout moves content; only do it while
      // the section is off screen, or on the user's own scroll gesture.
      const r = root.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (!onScreen) start();
      else {
        const events = ["wheel", "touchstart", "keydown", "scroll"] as const;
        arm = () => {
          events.forEach((t) => window.removeEventListener(t, arm!));
          arm = null;
          start();
        };
        events.forEach((t) => window.addEventListener(t, arm!, { passive: true, once: true }));
      }

      return () => {
        cancelled = true;
        if (arm) {
          const fn = arm;
          (["wheel", "touchstart", "keydown", "scroll"] as const).forEach((t) => window.removeEventListener(t, fn));
        }
        handle?.destroy();
      };
    },
    [milestones],
  );

  const onClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const btn = (e.target as Element).closest<HTMLElement>('[data-journey="painting"]');
      if (!btn) return;
      const station = stations.find((s) => s.id === btn.dataset.id);
      if (!station) return;
      setEntered({ station, from: btn.getBoundingClientRect(), trigger: btn });
    },
    [stations],
  );

  const close = useCallback(() => setEntered(null), []);

  return (
    // Fills the (tall) section so the sticky stage inside can travel its full height.
    <div ref={ref} onClick={onClick} style={{ height: "100%" }}>
      {children}
      {entered ? (
        <JourneyScene
          station={entered.station}
          milestones={allMilestones.filter((m) => m.at === entered.station.id)}
          from={entered.from}
          trigger={entered.trigger}
          onClose={close}
        />
      ) : null}
    </div>
  );
}
