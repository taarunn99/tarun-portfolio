"use client";

import { useActionState, useState } from "react";
import Script from "next/script";
import { sendEnquiry, type EnquiryState } from "@/app/contact/actions";
import styles from "./ContactForm.module.css";

type Props = {
  email: string;
  turnstileSiteKey?: string;
};

const initial: EnquiryState = { status: "idle" };

export function ContactForm({ email, turnstileSiteKey }: Props) {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const [startedAt, setStartedAt] = useState("");
  const [loadTurnstile, setLoadTurnstile] = useState(false);

  // First interaction marks the start time (used server-side as a minimum fill-time check)
  // and triggers the lazy Turnstile script. Event handlers, not effects: no hydration mismatch.
  const onInteract = () => {
    if (!startedAt) setStartedAt(String(Date.now()));
    if (!loadTurnstile) setLoadTurnstile(true);
  };

  if (state.status === "sent") {
    return (
      <div className={styles.done} role="status">
        <p className={styles.doneTitle}>Sent.</p>
        <p>Thanks. I read everything and reply within two working days.</p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={styles.form}
      onFocus={onInteract}
      onPointerEnter={onInteract}
    >
      {turnstileSiteKey && loadTurnstile ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      ) : null}

      <fieldset className={styles.track}>
        <legend className={styles.legend}>This is about</legend>
        <label className={styles.radio}>
          <input type="radio" name="track" value="role" defaultChecked required />
          <span>A role</span>
        </label>
        <label className={styles.radio}>
          <input type="radio" name="track" value="consulting" />
          <span>A project or consulting</span>
        </label>
      </fieldset>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Company <span className={styles.optional}>optional</span></span>
        <input name="company" type="text" autoComplete="organization" maxLength={120} />
      </label>

      <label className={styles.field}>
        <span>Message</span>
        <textarea name="message" rows={6} required minLength={20} maxLength={4000} />
      </label>

      {/* Honeypot — real users never see or fill this */}
      <label className={styles.hp} aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <input type="hidden" name="startedAt" value={startedAt} readOnly />

      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark" data-size="flexible" /> : null}

      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
        <a href={`mailto:${email}`} className={styles.alt}>
          or email directly
        </a>
      </div>
    </form>
  );
}
