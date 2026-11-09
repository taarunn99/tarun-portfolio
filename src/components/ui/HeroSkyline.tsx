import { getImageProps } from "next/image";
import HeroSkylineCanvas from "@/components/scene/HeroSkylineCanvas";
import { getImage } from "@/lib/images";
import styles from "./HeroSkyline.module.css";

/**
 * Night Dubai skyline (Emirates Towers, Museum of the Future, Burj Khalifa)
 * with a cut-out sky, so the aurora shows through above the towers.
 *
 * Painted into a canvas rather than an <img>: it is the largest graphic in
 * the hero and would otherwise become the LCP element on phones, where the
 * image competes with scripts on a slow connection. The hero copy stays the
 * LCP; the city fades up right after. Phones get a crop around the Burj.
 */
export function HeroSkyline({ className }: { className?: string }) {
  const wide = getImage("hero-skyline");
  const phone = getImage("hero-skyline-mobile");
  if (!wide || !phone) return null;

  const common = { alt: "", fill: true, quality: 60 } as const;
  const wideSet = getImageProps({ ...common, src: wide.src, sizes: "80vw" }).props.srcSet ?? "";
  const phoneSet = getImageProps({ ...common, src: phone.src, sizes: "100vw" }).props.srcSet ?? "";

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} aria-hidden="true">
      <HeroSkylineCanvas phoneSet={phoneSet} wideSet={wideSet} phoneQuery="(max-width: 47.99rem)" />
      <div className={styles.horizon} />
    </div>
  );
}
