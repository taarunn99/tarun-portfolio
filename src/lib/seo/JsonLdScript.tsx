import { serializeJsonLd } from "./jsonld";

/** Renders one or more JSON-LD blocks. Server component; data blocks are not executed, so no nonce is needed. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(block) }} />
      ))}
    </>
  );
}
