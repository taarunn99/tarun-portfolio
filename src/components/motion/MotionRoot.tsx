"use client";

import { useEffect } from "react";
import { loadMotion } from "./runtime";
import { Cursor } from "./Cursor";

/**
 * Mounted once in the root layout. Kicks off the (gated) motion runtime so
 * Lenis is ready by the time the user scrolls, and renders the cursor label.
 */
export function MotionRoot() {
  useEffect(() => {
    void loadMotion();
  }, []);

  return <Cursor />;
}
