import { Page } from "@/components/sections/Page";
import { Hero } from "@/components/sections/Hero";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ServicesList } from "@/components/sections/ServicesList";
import { ContactCta } from "@/components/sections/ContactCta";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { personJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";

export default function HomePage() {
  return (
    <Page>
      <JsonLd data={[webSiteJsonLd(), personJsonLd()]} />
      <Hero />
      <ProofStrip />
      <FeaturedWork />
      <ServicesList />
      <ContactCta />
    </Page>
  );
}
