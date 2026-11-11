"use client";

import { useEffect } from "react";
import { STORY_SELECTOR, storyProgress } from "@/lib/story-progress";

/**
 * Drives a pinned scroll story with one CSS custom property: `--p` (0 to 1)
 * on the nearest `[data-story]`. Captions and copy fade from it in CSS, so
 * they work before (and without) the WebGL scene. Also flags `data-past`
 * once the hero copy has left, so its links leave the tab order.
 *
 * Tiny on purpose: no GSAP, no Lenis dependency, one rAF per scroll burst.
 */
export function StoryScroll({ id, targets, prop = "--p" }: { id: string; targets?: string; prop?: string }) {
  useEffect(() => {
    const story = document.getElementById(id)?.closest<HTMLElement>(STORY_SELECTOR);
    if (!story) return;

    // Writing --p on the story makes every descendant restyle each frame;
    // `targets` (a selector inside the story) narrows it to the elements
    // that actually read it.
    const sinks = targets ? Array.from(story.querySelectorAll<HTMLElement>(targets)) : [story];
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const p = storyProgress(story);
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      const v = p.toFixed(4);
      for (const el of sinks) el.style.setProperty(prop, v);
      story.toggleAttribute("data-past", p > 0.09);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [id, targets, prop]);

  return null;
}
