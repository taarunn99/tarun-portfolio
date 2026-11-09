import { ImageResponse } from "next/og";
import { services } from "@/content/services";
import { site } from "@/content/site";

export const alt = "Service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);

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
          background: "radial-gradient(60% 50% at 80% 20%, rgba(0,209,178,0.16), transparent 70%), #03070b",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: "#9aa5b1" }}>
          <div style={{ width: 36, height: 2, background: "#00d1b2" }} />
          {s?.eyebrow ?? "Services"} · Dubai
        </div>
        <div style={{ fontSize: 66, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1.02, maxWidth: 1000 }}>{s?.title ?? site.seoTitle}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9aa5b1" }}>
          <div>{site.name}</div>
          <div>{site.url.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size,
  );
}
