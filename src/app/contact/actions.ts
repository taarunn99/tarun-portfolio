"use server";

import { z } from "zod";
import { env } from "@/lib/env";

export type EnquiryState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

const schema = z.object({
  track: z.enum(["role", "consulting"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(20).max(4000),
  website: z.string().max(0), // honeypot must be empty
  startedAt: z.string().optional(),
  "cf-turnstile-response": z.string().optional(),
});

const MIN_FILL_MS = 3000;

async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!env.turnstileSecret) return true; // not configured → skip (honeypot + timing still apply)
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.turnstileSecret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please check the form: name, a valid email and a message of at least 20 characters are needed." };
  }
  const data = parsed.data;

  // Timing check: bots submit instantly
  const started = Number(data.startedAt);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS) {
    return { status: "sent" }; // silently drop, look successful
  }

  if (!(await verifyTurnstile(data["cf-turnstile-response"]))) {
    return { status: "error", message: "The spam check did not pass. Please try again, or email directly." };
  }

  if (!env.resendApiKey) {
    return { status: "error", message: "The form is not connected yet. Please use the email link below." };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resendApiKey);
    const subject = `${data.track === "role" ? "Role" : "Project"} enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`;
    const text = [
      `Track: ${data.track}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.company ? `Company: ${data.company}` : null,
      "",
      data.message,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const { error } = await resend.emails.send({
      from: env.resendFrom,
      to: env.contactTo,
      replyTo: data.email,
      subject,
      text,
    });
    if (error) return { status: "error", message: "Sending failed on my side. Please email directly." };
    return { status: "sent" };
  } catch {
    return { status: "error", message: "Sending failed on my side. Please email directly." };
  }
}
