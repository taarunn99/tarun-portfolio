import Image from "next/image";
import type { StationId } from "./geometry";
import { polygonPoints, skylines } from "./skylines";
import type { SceneImage } from "./types";
import styles from "./scenes.module.css";

type Props = {
  id: StationId;
  image: SceneImage | null;
  /** `sizes` for the manifest image when present */
  sizes?: string;
};

/**
 * The painting's content: the manifest backdrop when it exists, otherwise a
 * procedural sky with the station's silhouette. Decorative — callers label
 * the surrounding control. Server-safe; also used inside the scene frame.
 */
export function SceneArt({ id, image, sizes = "(min-width: 64rem) 20vw, 50vw" }: Props) {
  const sky = skylines[id];
  return (
    <span className={styles.art} aria-hidden="true">
      {image ? (
        <Image
          src={image.src}
          alt=""
          fill
          sizes={sizes}
          placeholder={image.blurDataURL ? "blur" : undefined}
          blurDataURL={image.blurDataURL}
          className={styles.image}
        />
      ) : (
        <>
          <span className={styles.sky} />
          <svg className={styles.silhouette} viewBox="0 0 240 160" preserveAspectRatio="xMidYMax slice">
            {sky.shapes.map((shape, i) =>
              shape.kind === "poly" ? (
                <polygon key={i} className={shape.tone === "ink" ? styles.ink : styles.ink2} points={polygonPoints(shape.points, 240, 160)} />
              ) : (
                <circle key={i} className={styles.inkRing} cx={shape.cx * 240} cy={shape.cy * 160} r={shape.r * 160} strokeWidth={shape.width * 160} />
              ),
            )}
          </svg>
        </>
      )}
    </span>
  );
}
