import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import { services } from "@/content/services";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";
import type { ServiceSlug } from "@/content/types";
import { Page } from "@/components/sections/Page";
import { WorkCard } from "@/components/sections/WorkCard";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
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
      <section className={`container ${styles.head}`}>
        <nav className={styles.switcher} aria-label="Services">
          {services.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} className={styles.switch} aria-current={o.slug === s.slug ? "page" : undefined}>
              {o.eyebrow}
            </Link>
          ))}
        </nav>
        <Heading as="h1" className={styles.title} text={s.title} />
        <p className={styles.lead}>{s.intro}</p>
      </section>

      <Reveal as="section" className={`container ${styles.twoCol}`}>
        <div>
          <h2 className={styles.h2}>What you get</h2>
          <ul className={styles.list}>
            {s.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={styles.h2}>What it did last time</h2>
          <ul className={styles.list}>
            {s.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </Reveal>

      {proof.length > 0 ? (
        <section className={`container ${styles.proof}`} aria-labelledby="proof-title">
          <p className="eyebrow">Proof</p>
          <h2 id="proof-title" className={styles.h2}>Case studies</h2>
          <Reveal as="div" className={styles.grid} stagger>
            {proof.map((cs) => (
              <WorkCard key={cs.slug} cs={cs} index={caseStudies.findIndex((c) => c.slug === cs.slug)} />
            ))}
          </Reveal>
        </section>
      ) : null}

      <Reveal as="section" className={`container ${styles.faq}`}>
        <h2 className={styles.h2}>Questions I get asked</h2>
        <dl className={styles.faqList}>
          {s.faq.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <section className={`container ${styles.cta}`}>
        <p className={styles.ctaText}>
          Tell me about the business and the problem; I&apos;ll say whether I&apos;m the right person and what it would take.
        </p>
        <Magnetic>
          <Link href="/contact" className="btn btn-primary">
            Start a conversation
          </Link>
        </Magnetic>
        <p className={styles.others}>
          Also:{" "}
          {others.map((o, i) => (
            <span key={o.slug}>
              <Link href={`/services/${o.slug as ServiceSlug}`}>{o.eyebrow}</Link>
              {i < others.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </section>
    </Page>
  );
}
