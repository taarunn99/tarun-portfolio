import { proof, marquee } from "@/content/site";
import { Numeral } from "@/components/ui/Numeral";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./ProofStrip.module.css";

export function ProofStrip() {
  return (
    <section id="proof" className={styles.strip} aria-label="Results">
      <Reveal as="ul" className={`container ${styles.grid}`} stagger>
        {proof.map((m) => (
          <li key={m.label}>
            <Numeral metric={m} size="md" />
          </li>
        ))}
      </Reveal>
      <Marquee items={marquee} label="Stack" />
    </section>
  );
}
