import Image from "next/image";
import type { ImageRef } from "@/content/types";
import { getImage } from "@/lib/images";
import styles from "./Cover.module.css";

type Props = {
  image: ImageRef;
  /** Short label for the placeholder tile (e.g. project name) */
  label?: string;
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Renders an optimised image from the manifest, or — until imagery lands —
 * a deterministic placeholder tile (CSS only, no bitmap, no fake screenshot).
 */
export function Cover({ image, label, index = 0, sizes = "(min-width: 64rem) 33vw, 100vw", priority, className }: Props) {
  const entry = getImage(image.id);
  if (entry) {
    return (
      <Image
        src={entry.src}
        alt={image.alt}
        width={entry.width}
        height={entry.height}
        sizes={sizes}
        placeholder={entry.blurDataURL ? "blur" : "empty"}
        blurDataURL={entry.blurDataURL}
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        className={`${styles.img} ${className ?? ""}`}
      />
    );
  }
  const hue = (index * 47) % 360;
  return (
    <div
      className={`${styles.placeholder} ${className ?? ""}`}
      role="img"
      aria-label={image.alt}
      style={{ ["--ph-hue" as string]: hue }}
    >
      <span className={styles.phIndex}>{String(index + 1).padStart(2, "0")}</span>
      {label ? <span className={styles.phLabel}>{label}</span> : null}
    </div>
  );
}
