import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(201,245,90,0.14), transparent 70%), #0a0a0a",
          color: "#f5f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a3a3ab",
          }}
        >
          <div style={{ width: 40, height: 2, background: "#c9f55a" }} />
          {site.role}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 0.95 }}>
            {site.name}
          </div>
          <div style={{ fontSize: 36, color: "#a3a3ab" }}>{site.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
