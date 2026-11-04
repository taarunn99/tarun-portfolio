import { capabilities } from "@/content/capabilities";
import { Heading } from "@/components/ui/Heading";
import { Numeral } from "@/components/ui/Numeral";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./Capabilities.module.css";

export function Capabilities() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="cap-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">What I run</p>
          <Heading as="h2" id="cap-title" className={styles.title} text="One person, six departments." accent="six" />
          <p className={styles.lead}>
            At Lapiz Group I own the websites, the ad account, the ERP, the automations, the brand work and the IT — and I measure each one in money.
          </p>
        </header>
        <Reveal as="ul" className={styles.bento} stagger>
          {capabilities.map((c) => (
            <li key={c.id} className={styles.cell}>
              <div className={styles.cellHead}>
                <h3 className={styles.cellTitle}>{c.title}</h3>
                {c.stat ? <Numeral metric={c.stat} size="sm" /> : null}
              </div>
              <p className={styles.blurb}>{c.blurb}</p>
              <ul className={styles.items} aria-label={`${c.title} tools`}>
                {c.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
