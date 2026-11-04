import type { Article, BreadcrumbList, Person, ProfilePage, Service, WebSite, WithContext } from "schema-dts";
import type { CaseStudy, Service as ServiceContent } from "@/content/types";
import { site } from "@/content/site";

const personId = `${site.url}/#person`;
const siteId = `${site.url}/#website`;

export function personJsonLd(): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: site.name,
    url: site.url,
    jobTitle: site.role,
    description: site.description,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressCountry: site.location.countryCode,
    },
    worksFor: {
      "@type": "Organization",
      name: "Lapiz Blue General Trading LLC",
      url: "https://lapizblue.com",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Vellore Institute of Technology, Bhopal" },
      { "@type": "CollegeOrUniversity", name: "National University of Singapore, School of Computing" },
    ],
    knowsAbout: [
      "Next.js",
      "TypeScript",
      "React",
      "Supabase",
      "Zoho Books",
      "Zoho CRM",
      "Zoho Deluge",
      "Google Ads",
      "Technical SEO",
      "AI automation",
      "Claude API",
      "Model Context Protocol",
    ],
    sameAs: site.socials.map((s) => s.href),
  };
}

export function webSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteId,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": personId },
  };
}

export function profilePageJsonLd(): WithContext<ProfilePage> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/about`,
    dateModified: site.updated,
    mainEntity: { "@id": personId },
  };
}

export function articleJsonLd(cs: CaseStudy): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    description: cs.summary,
    url: `${site.url}/work/${cs.slug}`,
    datePublished: cs.updated,
    dateModified: cs.updated,
    author: { "@id": personId },
    publisher: { "@id": personId },
    isPartOf: { "@id": siteId },
    about: cs.client,
    keywords: cs.tags.join(", "),
    image: `${site.url}/work/${cs.slug}/opengraph-image`,
  };
}

export function serviceJsonLd(s: ServiceContent): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.description,
    url: `${site.url}/services/${s.slug}`,
    provider: { "@id": personId },
    areaServed: [
      { "@type": "City", name: "Dubai" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
    serviceType: s.eyebrow,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/** Serialise for a <script type="application/ld+json"> with `<` escaped. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
