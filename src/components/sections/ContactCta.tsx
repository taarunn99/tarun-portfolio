import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Magnetic } from "@/components/motion/Magnetic";
import { SplitLines } from "@/components/motion/SplitLines";
import styles from "./ContactCta.module.css";

export function ContactCta() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="cta-title">
      <div className="container">
        <p className="eyebrow">Contact</p>
        <SplitLines as="h2" className={styles.title}>
          <Heading as="span" text="Let's build something fast." accent="fast." />
        </SplitLines>
        <p id="cta-title" className="sr-only">Let&apos;s build something fast.</p>
        <p className={styles.lead}>
          Roles, consulting, or a second opinion on a stack — one message is enough.
        </p>
        <Magnetic>
          <Link href="/contact" className="btn btn-primary">
            Start a conversation
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
