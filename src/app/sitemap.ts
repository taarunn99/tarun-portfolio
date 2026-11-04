import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const at = (iso: string) => new Date(iso);
  return [
    { url: base, lastModified: at(site.updated), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/work`, lastModified: at(site.updated), changeFrequency: "monthly", priority: 0.9 },
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: at(s.updated),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...caseStudies.map((c) => ({
      url: `${base}/work/${c.slug}`,
      lastModified: at(c.updated),
      changeFrequency: "yearly" as const,
      priority: c.featured ? 0.8 : 0.7,
    })),
    { url: `${base}/about`, lastModified: at(site.updated), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resume`, lastModified: at(site.updated), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: at(site.updated), changeFrequency: "yearly", priority: 0.5 },
  ];
}
