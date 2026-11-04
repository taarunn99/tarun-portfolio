import { ImageResponse } from "next/og";
import { site, proof } from "@/content/site";

export const alt = site.seoTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const top = proof.slice(0, 3);
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
          {site.role} · {site.location.city}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 120, fontWeight: 600, letterSpacing: -6, lineHeight: 0.95 }}>{site.name}</div>
          <div style={{ fontSize: 32, color: "#9a9a94", maxWidth: 900 }}>{site.positioning}</div>
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {top.map((m) => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 44, fontWeight: 600, color: "#c9f55a", letterSpacing: -1.5 }}>{m.value}</div>
              <div style={{ fontSize: 18, color: "#9a9a94", textTransform: "uppercase", letterSpacing: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
