const GESTURES = ["pointermove", "touchstart", "wheel", "keydown"] as const;

/**
 * Runs `callback` once, either on the first user gesture or `fallbackMs`
 * after the window `load` event — whichever comes first.
 *
 * Used to keep enhancement scripts (Three.js, Lenis) out of the critical
 * path: they must never compete with first paint or the first interaction.
 * Lighthouse never emits input, so the fallback is deliberately a wall-clock
 * timer rather than `requestIdleCallback`, which fires almost immediately on
 * a fast page and would pull the work back into the load window.
 *
 * Returns a cancel function.
 */
export function afterInteraction(callback: () => void, fallbackMs = 3500): () => void {
  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    for (const type of GESTURES) window.removeEventListener(type, fire);
    window.removeEventListener("load", arm);
    if (timer !== undefined) clearTimeout(timer);
  };

  const fire = () => {
    if (done) return;
    done = true;
    cleanup();
    callback();
  };

  const arm = () => {
    timer = setTimeout(fire, fallbackMs);
  };

  for (const type of GESTURES) {
    window.addEventListener(type, fire, { passive: true });
  }

  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });

  return () => {
    done = true;
    cleanup();
  };
}
