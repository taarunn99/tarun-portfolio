import { ImageResponse } from "next/og";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { site } from "@/content/site";

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  const title = cs?.title ?? site.name;
  const metric = cs?.headlineMetric;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(60% 50% at 80% 20%, rgba(201,245,90,0.14), transparent 70%), #0a0a0a",
          color: "#f2f2f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: "#9a9a94" }}>
          <div style={{ width: 36, height: 2, background: "#c9f55a" }} />
          {cs?.client ?? site.role}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1.02, maxWidth: 1000 }}>{title}</div>
          {metric ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <div style={{ fontSize: 56, fontWeight: 600, color: "#c9f55a", letterSpacing: -2 }}>{metric.value}</div>
              <div style={{ fontSize: 26, color: "#9a9a94", textTransform: "uppercase", letterSpacing: 2 }}>{metric.label}</div>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9a9a94" }}>
          <div>{site.name}</div>
          <div>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size,
  );
}
