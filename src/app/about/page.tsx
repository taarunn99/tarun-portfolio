import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { resume } from "@/content/resume";
import { Page } from "@/components/sections/Page";
import { JourneyRoute } from "@/components/sections/JourneyRoute";
import { Capabilities } from "@/components/sections/Capabilities";
import { ProjectTimeline } from "@/components/sections/ProjectTimeline";
import { Skills } from "@/components/sections/Skills";
import { ContactCta } from "@/components/sections/ContactCta";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd, profilePageJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tarun Shukla is Head of Technology at a three-branch building-materials group in Dubai, running websites, Google Ads, SEO, Zoho ERP automation, AI workflows and IT as a one-person team. B.Tech CS, NUS certificates, AWS Solutions Architect.",
  alternates: { canonical: "/about" },
  openGraph: { title: `About | ${site.name}`, url: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <Page>
      <JsonLd data={[profilePageJsonLd(), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]} />
      <section className={`container ${styles.head}`}>
        <p className="eyebrow">About</p>
        <Heading as="h1" className={styles.title} text="Performance is a feature. So is finishing." accent="finishing." />
        <div className={styles.cols}>
          <div className={styles.prose}>
            <p className={styles.lead}>
              I run technology, growth and operations for Lapiz Group, three building-materials companies in Dubai, Sharjah and Abu Dhabi, as a team of one with two mentored interns.
            </p>
            <p>
              Since May 2025 that has meant six production websites in Next.js and TypeScript, a Google Ads channel that returned 9.2× its spend in invoiced revenue, SEO that put the group&apos;s brands at position one and into Google&apos;s AI answers, and a Zoho ERP taken in-house and automated until the warehouse and the accounts agreed.
            </p>
            <p>
              Before that: a Computer Science degree at VIT Bhopal, certificates from NUS School of Computing in applied machine learning and deep learning, an AWS Solutions Architect certification and a full-stack internship. I build with AI tooling every day: the model proposes, the code decides.
            </p>
            <p className={styles.availability}>{site.availability}</p>
          </div>
          <Reveal as="dl" className={styles.facts} stagger>
            <div><dt>Based</dt><dd>{site.location.city}, {site.location.country}</dd></div>
            <div><dt>Now</dt><dd>{resume.work[0].position.split(": ")[0]}, Lapiz Group</dd></div>
            <div><dt>Education</dt><dd>{resume.education.map((e) => e.institution.split(",")[0]).join(" · ")}</dd></div>
            <div><dt>Certified</dt><dd>AWS Solutions Architect Associate · AWS Cloud Practitioner</dd></div>
            <div><dt>Languages</dt><dd>English, Hindi</dd></div>
            <div><dt>Résumé</dt><dd><Link href="/resume">HTML and PDF</Link></dd></div>
          </Reveal>
        </div>
      </section>
      <JourneyRoute variant="full" />
      <ProjectTimeline />
      <Capabilities />
      <Skills />
      <ContactCta />
    </Page>
  );
}
