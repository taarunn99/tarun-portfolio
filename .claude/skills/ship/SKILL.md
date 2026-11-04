---
name: ship
description: Release procedure for this portfolio — run all checks and Lighthouse gates, commit with a conventional message, push to GitHub, confirm the Vercel deployment is READY and audit the live URL. Use when asked to ship, deploy, release, push or publish.
context: fork
disable-model-invocation: true
---

# Ship

1. `npm run check` — must be green.
2. `LH_RUNS=3 npm run lighthouse` — every category 100 on mobile and desktop. If a route other than `/` changed, also run with `LH_URL=http://localhost:3100<route>` after `npm run build && npx next start -p 3100 &`.
3. `git status`; stage intentionally; commit as `type(scope): summary` with a body listing what changed and the Lighthouse result; end with the Co-Authored-By trailer in effect for the session.
4. `git push origin main`. Confirm `gh run list --limit 1` goes green.
5. Vercel: project `tarun-portfolio`, team `tarun-shuklas-projects`. Wait for the deployment to be READY (Vercel MCP `list_deployments` / `get_deployment`, or the dashboard in Chrome). On failure read build logs (`list_deployment_events`) and fix before anything else.
6. `LH_URL=<production url> LH_RUNS=3 npm run lighthouse`; `curl -I <url>` shows CSP/HSTS/COOP; `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/opengraph-image` return 200.
7. Report: commit hash, deployment URL, Lighthouse scores (local + live), anything skipped.

Never push with failing checks; never skip the live audit.
