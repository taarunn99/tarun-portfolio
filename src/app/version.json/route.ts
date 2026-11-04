// Build identity for deploy verification (the production Lighthouse workflow
// polls this until the live site serves the commit it was triggered for).
// Values are read at build time, so the route stays fully static.
export async function GET() {
  return Response.json(
    {
      sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      ref: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
    },
    { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
  );
}
