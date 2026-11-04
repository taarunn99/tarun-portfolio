# 0006 — Contact form via Server Action + Resend + Turnstile

Status: accepted · Date: 2026-11-04 · Evidence: `research/04` §4

## Context

Enquiries must reach a Gmail inbox without exposing the address, at zero cost, with spam control, on a static Vercel site. Nodemailer/Gmail SMTP from Vercel functions is unreliable; Formspree free tier is 50/month; Web3Forms works but is a third-party form endpoint.

## Decision

Next.js Server Action → zod validation → honeypot → minimum fill time → Cloudflare Turnstile `siteverify` → Resend (`to` from `CONTACT_TO`, `replyTo` = visitor). Free tier: 3,000/month, 100/day; from `onboarding@resend.dev` until a domain is verified. Vercel WAF rate-limit rule on the contact path. If `RESEND_API_KEY` is missing the UI degrades to a `mailto:` link.

## Consequences

+ Address never in HTML; spam blocked at three layers; $0.
− Requires two external keys from the user; Turnstile adds one third-party origin to the CSP (`challenges.cloudflare.com`).
