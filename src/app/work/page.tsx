import type { Metadata } from "next";
import { caseStudies, allTags, tagLabels } from "@/content/case-studies";
import { site } from "@/content/site";
import { Page } from "@/components/sections/Page";
import { WorkIndex } from "@/components/sections/WorkIndex";
import { WebsitesShowcase } from "@/components/sections/WebsitesShowcase";
import { websiteCaseStudies } from "@/content/websites";
import { Heading } from "@/components/ui/Heading";
import { WorkGridCanvas } from "@/components/scene/work-grid/WorkGridCanvas";
import type { GridTile } from "@/components/scene/work-grid/types";
import { getImage } from "@/lib/images";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: `${caseStudies.length} products and programmes shipped as Head of Technology in Dubai: websites, Google Ads, Zoho ERP automation and AI tools, each with the number that mattered.`,
  alternates: { canonical: "/work" },
  openGraph: { title: `Work | ${site.name}`, url: `${site.url}/work` },
};

/** Covers for the WebGL grid: the ~960 px webp variant, or null for a procedural tile. */
function gridTiles(): GridTile[] {
  return caseStudies.map((c, index) => {
    const image = getImage(c.cover.id);
    const webp = image?.variants?.webp;
    const variant = webp?.find((v) => v.w === 960) ?? webp?.[webp.length - 1];
    return {
      slug: c.slug,
      short: c.short,
      client: c.client,
      year: c.year,
      index,
      src: variant?.src ?? image?.src ?? null,
    };
  });
}

export default function WorkPage() {
  const rest = caseStudies.filter((c) => !websiteCaseStudies.has(c.slug));
  const tags = allTags.filter((id) => rest.some((c) => c.tags.includes(id))).map((id) => ({ id, label: tagLabels[id] }));
  return (
    <Page>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <section className={styles.hero}>
        <WorkGridCanvas tiles={gridTiles()} />
        <div className={styles.overlay}>
          <div className={`container ${styles.head}`}>
            <p className="eyebrow">Work</p>
            <Heading as="h1" className={styles.title} text="Every product, with its number." accent="number." />
            <p className={styles.lead}>
              {caseStudies.length} case studies from my work since May 2025 as a one-person technology, growth and operations team, plus one from before.
            </p>
            <p className={styles.hint} aria-hidden="true">
              Drag · Scroll · Click
            </p>
          </div>
        </div>
      </section>
      <WebsitesShowcase />
      <section className={`container ${styles.index}`} aria-labelledby="all-work">
        <header className={styles.indexHead}>
          <p className="eyebrow">Everything else</p>
          <h2 id="all-work" className={styles.indexTitle}>
            Systems, tools and <em className="accent-word">automation</em>
          </h2>
        </header>
        <WorkIndex items={rest} tags={tags} />
      </section>
    </Page>
  );
}
