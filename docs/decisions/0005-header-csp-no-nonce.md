# 0005 — Header-based CSP without nonces

Status: accepted · Date: 2026-11-04 · Evidence: `research/09` §4

## Context

Nonce-based CSP requires per-request rendering (proxy/middleware), which is incompatible with Partial Prerendering and static CDN caching — i.e. with the Lighthouse-100 static shell. Lighthouse 13 scores `csp-xss`, `has-hsts`, `origin-isolation`, `clickjacking-mitigation` as **informational** (weight 0); a *broken* CSP, however, produces console errors and DevTools issues that are scored.

## Decision

Set CSP in `next.config.ts` `headers()` with `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`, `style-src 'self' 'unsafe-inline'`, strict `object-src/base-uri/form-action/frame-ancestors`, `img-src 'self' data: blob:`, `worker-src 'self' blob:`, plus Turnstile origins in `connect-src`/`frame-src`. HSTS preload, COOP same-origin, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options.

## Consequences

+ Static output preserved; all scored Best-Practices audits pass; green ticks for HSTS/COOP/clickjacking.
− `csp-xss` stays an informational warning. Accepted; revisit if Next ships hash-based CSP for inline runtime scripts.
