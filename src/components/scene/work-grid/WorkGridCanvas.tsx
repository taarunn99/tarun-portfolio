"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { afterInteraction } from "@/lib/after-interaction";
import type { GridTile } from "./types";

const WorkGrid = dynamic(() => import("./WorkGrid"), { ssr: false });

type Props = {
  tiles: readonly GridTile[];
};

/**
 * Gate for the work grid scene. Mounts the WebGL island only on devices with
 * a fine pointer and hover, when motion is allowed, Data Saver is off, and
 * after the first user gesture (or a few seconds after load). Touch devices
 * never load it — the section collapses to the plain heading via CSS.
 */
export function WorkGridCanvas({ tiles }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (!fine.matches || reduced.matches || nav.connection?.saveData) return;

    const cancel = afterInteraction(() => setReady(true));
    const onChange = () => {
      if (reduced.matches || !fine.matches) {
        cancel();
        setReady(false);
      }
    };
    reduced.addEventListener("change", onChange);
    fine.addEventListener("change", onChange);
    return () => {
      cancel();
      reduced.removeEventListener("change", onChange);
      fine.removeEventListener("change", onChange);
    };
  }, []);

  return ready ? <WorkGrid tiles={tiles} /> : null;
}
