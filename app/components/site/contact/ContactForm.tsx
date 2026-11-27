"use client";

import { useState, type FormEvent } from "react";
import s from "../site.module.css";
import { PHONE_DISPLAY, WHATSAPP_URL } from "../data";

const TOPICS = ["Eye Test", "Frames", "Lenses", "Order status"] as const;
type Topic = (typeof TOPICS)[number];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<Topic>("Eye Test");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email || null, interest: topic, message: message || null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const whatsappFollowUp = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello Darshana Optical, I just sent a message from your website.\nName: ${name}\nTopic: ${topic}\n${message}`,
  )}`;

  if (status === "sent") {
    return (
      <div role="status" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16, padding: "40px 0" }}>
        <span
          className={s.pop}
          style={{ width: 96, height: 96, borderRadius: "50%", border: "10px solid var(--charcoal)", borderTopColor: "var(--orange)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1F2024" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <strong className={`${s.display} ${s.up}`} style={{ fontSize: 32 }}>
          Message sent
        </strong>
        <span className={`${s.up} ${s.d1}`} style={{ maxWidth: 360, fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
          Thanks! We&apos;ll get back to you soon. For anything urgent, call {PHONE_DISPLAY}.
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          <a href={whatsappFollowUp} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ height: 48, padding: "0 20px", fontSize: 15 }}>
            Also send on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setStatus("idle");
            }}
            className={s.pill}
            style={{ height: 48, padding: "0 20px", fontSize: 15, background: "var(--paper)", color: "var(--ink)" }}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={s.stack} style={{ gap: 14 }}>
      <h2 className={s.h3}>Send us a message</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <label className={s.field}>
          Name
          <input type="text" name="name" autoComplete="name" required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={s.field}>
          Mobile
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            placeholder="+91"
            maxLength={20}
            pattern="[+0-9 \-]{7,20}"
            title="Enter a valid phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>
      <label className={s.field}>
        <span>
          Email <small>(optional)</small>
        </span>
        <input type="email" name="email" autoComplete="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <div role="group" aria-label="Topic" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={topic === t}
            onClick={() => setTopic(t)}
            className={s.pill}
            style={{ height: 42, padding: "0 16px", fontSize: 14, ...(topic === t ? { background: "var(--night)", color: "var(--white)" } : { background: "var(--paper)", color: "var(--ink)" }) }}
          >
            {t}
          </button>
        ))}
      </div>
      <label className={s.field}>
        Message
        <textarea name="message" rows={4} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {status === "error" && (
        <p role="alert" className={s.formError} style={{ margin: 0 }}>
          We couldn&apos;t send your message. Check your connection and try again, or call {PHONE_DISPLAY}.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className={`${s.pill} ${s.pillOrange} ${s.btn}`}
        style={{ alignSelf: "flex-start", height: 56, padding: "0 28px", fontSize: 16, opacity: status === "sending" ? 0.7 : 1 }}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
