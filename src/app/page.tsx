import { Page } from "@/components/sections/Page";
import { Hero } from "@/components/sections/Hero";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Capabilities } from "@/components/sections/Capabilities";
import { JourneyRoute } from "@/components/sections/JourneyRoute";
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
      <Capabilities />
      <JourneyRoute variant="teaser" />
      <ServicesList />
      <ContactCta />
    </Page>
  );
}
