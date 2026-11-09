import type { Metadata } from "next";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env";
import { Page } from "@/components/sections/Page";
import { ContactForm } from "@/components/sections/ContactForm";
import { Heading } from "@/components/ui/Heading";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Tarun Shukla about Head of Digital / Technology roles in the UAE, or a Next.js, SEO, Zoho or AI automation project. Replies within two working days.",
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact | ${site.name}`, url: `${site.url}/contact` },
};

export default function ContactPage() {
  return (
    <Page>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <section className={`container ${styles.wrap}`}>
        <div className={styles.intro}>
          <p className="eyebrow">Contact</p>
          <Heading as="h1" className={styles.title} text="One message is enough." accent="enough." />
          <p className={styles.lead}>{site.availability}</p>
          <dl className={styles.facts}>
            <div><dt>Reply time</dt><dd>Within two working days</dd></div>
            <div><dt>Based</dt><dd>{site.location.city}, {site.location.countryCode} (GMT+4)</dd></div>
            <div><dt>Elsewhere</dt><dd>{site.socials.map((s, i) => (<span key={s.href}><a href={s.href} rel="me noreferrer" target="_blank">{s.label}</a>{i < site.socials.length - 1 ? " · " : ""}</span>))}</dd></div>
          </dl>
        </div>
        <div className={styles.formWrap}>
          <ContactForm email={site.email} turnstileSiteKey={publicEnv.turnstileSiteKey} />
        </div>
      </section>
    </Page>
  );
}
