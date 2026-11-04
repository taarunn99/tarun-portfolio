import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { site } from "@/content/site";
import { Page } from "@/components/sections/Page";
import { CaseStudyArticle } from "@/components/sections/CaseStudyArticle";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

async function loadCaseStudy(slug: string) {
  "use cache";
  cacheLife("max");
  return getCaseStudy(slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cs = await loadCaseStudy(slug);
  if (!cs) return {};
  return {
    title: cs.title,
    description: cs.summary,
    alternates: { canonical: `/work/${cs.slug}` },
    openGraph: {
      type: "article",
      title: `${cs.title} — ${site.name}`,
      description: cs.summary,
      url: `${site.url}/work/${cs.slug}`,
    },
    twitter: { card: "summary_large_image", title: cs.title, description: cs.summary },
  };
}

export default function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Page theme="paper">
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <CaseStudyContent params={params} />
      </Suspense>
    </Page>
  );
}

async function CaseStudyContent({ params }: Pick<PageProps<"/work/[slug]">, "params">) {
  const { slug } = await params;
  const cs = await loadCaseStudy(slug);
  if (!cs) notFound();
  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(cs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: cs.short, path: `/work/${cs.slug}` },
          ]),
        ]}
      />
      <CaseStudyArticle cs={cs} />
    </>
  );
}
