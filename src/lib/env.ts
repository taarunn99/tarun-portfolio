/** Server-side env access. Public values must be NEXT_PUBLIC_-prefixed and read directly. */
export const env = {
  contactTo: process.env.CONTACT_TO ?? "agmnwosgr@gmail.com",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  isVercel: Boolean(process.env.VERCEL),
} as const;

export const publicEnv = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
} as const;
