"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Tarun's local time (GMT+4), ticking each minute. Rendered after mount
 * only: the clock must never run during prerender, and an empty span until
 * then keeps the layout steady (its box is reserved in CSS).
 */
export function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className}>
      <span aria-hidden="true" data-dot />
      {now ? <time>{now}</time> : <span>--:--</span>} local time, GMT+4
    </span>
  );
}
