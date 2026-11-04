import Link from "next/link";
import { Page } from "@/components/sections/Page";

export default function NotFound() {
  return (
    <Page>
      <section className="container section" style={{ paddingTop: "10rem", display: "grid", gap: "1.5rem", justifyItems: "start" }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "var(--fs-display)", letterSpacing: "var(--ls-display)", lineHeight: "var(--lh-display)" }}>
          Nothing here.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "var(--fs-lead)" }}>The page moved or never existed. The work index has everything.</p>
        <Link href="/work" className="btn btn-primary">
          Go to work
        </Link>
      </section>
    </Page>
  );
}
