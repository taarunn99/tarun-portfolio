"use client";

import { useState } from "react";
import styles from "./FlipCard.module.css";

/**
 * Touch screens have no hover, so each flip card gets this small button to
 * turn it over. It flags `data-flipped` on the card; CSS does the rest.
 * Hidden on devices with a fine pointer, where hover flips the card.
 */
export function FlipToggle({ name }: { name: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={flipped}
      aria-label={`Show the numbers for ${name}`}
      onClick={(e) => {
        const next = !flipped;
        setFlipped(next);
        e.currentTarget.closest("article")?.toggleAttribute("data-flipped", next);
      }}
    >
      {flipped ? "Back" : "Numbers"}
    </button>
  );
}
