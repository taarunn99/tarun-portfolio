import { resume } from "@/content/resume";

/** JSON Resume-style export for ATS/LLM parsing. Static under Cache Components. */
export function GET() {
  return Response.json(resume, {
    headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
