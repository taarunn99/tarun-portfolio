import type { Metadata } from "next";
import { caseStudies, allTags, tagLabels } from "@/content/case-studies";
import { site } from "@/content/site";
import { Page } from "@/components/sections/Page";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { Heading } from "@/components/ui/Heading";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: `${caseStudies.length} products and programmes shipped as Head of Technology in Dubai — websites, Google Ads, Zoho ERP automation, AI tools — each with the number that mattered.`,
  alternates: { canonical: "/work" },
  openGraph: { title: `Work — ${site.name}`, url: `${site.url}/work` },
};

export default function WorkPage() {
  const tags = allTags.map((id) => ({ id, label: tagLabels[id] }));
  return (
    <Page>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <section className={`container ${styles.head}`}>
        <p className="eyebrow">Work</p>
        <Heading as="h1" className={styles.title} text="Every product, with its number." accent="number." />
        <p className={styles.lead}>
          {caseStudies.length} case studies from seventeen months as a one-person technology, growth and operations team — and one from before.
        </p>
      </section>
      <section className={`container ${styles.index}`} aria-labelledby="all-work">
        <h2 id="all-work" className="sr-only">
          All projects
        </h2>
        <WorkIndex items={[...caseStudies]} tags={tags} />
      </section>
    </Page>
  );
}
