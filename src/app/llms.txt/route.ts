import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";
import { services } from "@/content/services";

/** Plain-text index for AI crawlers (llms.txt convention). Static under Cache Components. */
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is ${site.role} at Lapiz Group in ${site.location.city}, ${site.location.country}. ${site.positioning}`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${site.url}/services/${s.slug}): ${s.description}`),
    "",
    "## Case studies",
    ...caseStudies.map((c) => `- [${c.title}](${site.url}/work/${c.slug}): ${c.summary} (${c.headlineMetric.value} ${c.headlineMetric.label})`),
    "",
    "## About",
    `- [About](${site.url}/about): background, journey and capabilities`,
    `- [Résumé](${site.url}/resume): HTML résumé, PDF and JSON`,
    `- [Contact](${site.url}/contact)`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" },
  });
}
