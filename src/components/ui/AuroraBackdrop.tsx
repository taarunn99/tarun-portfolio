import styles from "./AuroraBackdrop.module.css";

/** Fixed aurora sky behind dark pages. Static markup; all motion is CSS. */
export function AuroraBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.stars} />
      <div className={`${styles.band} ${styles.bandA}`} />
      <div className={`${styles.band} ${styles.bandB}`} />
      <div className={styles.fog} />
    </div>
  );
}
