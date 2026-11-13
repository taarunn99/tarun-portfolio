import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { services } from "@/content/services";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";
import type { ServiceSlug } from "@/content/types";
import { Page } from "@/components/sections/Page";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ContactCta } from "@/components/sections/ContactCta";
import type { CSSProperties } from "react";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

async function loadService(slug: string) {
  "use cache";
  cacheLife("max");
  return services.find((s) => s.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await loadService(slug);
  if (!s) return {};
  return {
    title: { absolute: s.seoTitle },
    description: s.description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: s.seoTitle, description: s.description, url: `${site.url}/services/${s.slug}` },
  };
}

/** No Suspense boundary: every slug is prerendered inline so the h1 is the LCP (see work/[slug]). */
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = await loadService(slug);
  if (!s) notFound();
  const proof = s.proof.map((p) => caseStudies.find((c) => c.slug === p)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const others = services.filter((o) => o.slug !== s.slug);

  return (
    <Page>
      <JsonLd
        data={[
          serviceJsonLd(s),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services/nextjs-development-dubai" },
            { name: s.eyebrow, path: `/services/${s.slug}` },
          ]),
        ]}
      />
      {/* ---- opening: the headline drifts back as you scroll, a huge faint
          service word slides slower behind it ---- */}
      <section className={styles.hero}>
        <p className={styles.ghost} aria-hidden="true">
          {s.eyebrow}
        </p>
        <div className={`container ${styles.head}`}>
          <nav className={styles.switcher} aria-label="Services">
            {services.map((o) => (
              <Link key={o.slug} href={`/services/${o.slug}`} className={styles.switch} aria-current={o.slug === s.slug ? "page" : undefined}>
                {o.eyebrow}
              </Link>
            ))}
          </nav>
          <Heading as="h1" className={styles.title} text={s.title} accent={s.accent} />
          <p className={styles.lead}>{s.intro}</p>
          <p className={styles.cue} aria-hidden="true">
            <span />
            Scroll
          </p>
        </div>
      </section>

      {/* ---- what you get: numbered cards that stack as you scroll ---- */}
      <section className={`container ${styles.get}`} aria-labelledby="get-title">
        <div className={styles.getHead}>
          <p className="eyebrow">What you get</p>
          <h2 id="get-title" className={styles.h2}>
            {s.deliverables.length} parts, one handover
          </h2>
        </div>
        <ol className={styles.deck}>
          {s.deliverables.map((d, i) => (
            <li key={d} className={styles.slot} style={{ "--i": i } as CSSProperties}>
              <div className={styles.card}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <p className={styles.cardText}>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- what it did: one big line per result, lighting up as it rises ---- */}
      <section className={`container ${styles.did}`} aria-labelledby="did-title">
        <p className="eyebrow">What it did last time</p>
        <h2 id="did-title" className="sr-only">
          What it did last time
        </h2>
        <ol className={styles.results}>
          {s.outcomes.map((o, i) => (
            <li key={o} className={styles.result}>
              <span className={styles.resultNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")} / {String(s.outcomes.length).padStart(2, "0")}
              </span>
              <p className={styles.resultText}>
                <span className={styles.fill}>{o}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {proof.length > 0 ? (
        <FeaturedWork
          items={proof}
          eyebrow="Proof"
          title="The case studies behind it."
          accent="behind"
          allHref={null}
          id="proof-title"
        />
      ) : null}

      {/* ---- questions: tap to open ---- */}
      <Reveal as="section" className={`container ${styles.faq}`}>
        <p className="eyebrow">Questions</p>
        <h2 className={styles.h2}>Questions I get asked</h2>
        <div className={styles.faqList}>
          {s.faq.map((f, i) => (
            <details key={f.q} className={styles.qa} open={i === 0}>
              <summary className={styles.q}>
                <span>{f.q}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <p className={styles.a}>{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <ContactCta />

      <nav className={`container ${styles.others}`} aria-label="Other services">
        Also:{" "}
        {others.map((o, i) => (
          <span key={o.slug}>
            <Link href={`/services/${o.slug as ServiceSlug}`}>{o.eyebrow}</Link>
            {i < others.length - 1 ? " · " : ""}
          </span>
        ))}
      </nav>
    </Page>
  );
}
