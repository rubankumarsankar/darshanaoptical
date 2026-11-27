"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import s from "../site.module.css";
import { MAPS_URL, PHONE_DISPLAY, WHATSAPP_URL } from "../data";

const TIME_ZONE = "Asia/Kolkata";
const SLOTS = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"] as const;
const VISIT_TYPES = ["Eye test", "Progressive lens consultation", "Child's eye test", "Contact lens trial", "Frame fitting"] as const;

interface Day {
  iso: string; // YYYY-MM-DD in store time
  dow: string;
  num: string;
  month: string;
}

/** Today plus the next six days, as seen on the store's clock. */
function nextSevenDays(now: Date): Day[] {
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, ...opts }).format(d);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86_400_000);
    return {
      iso: new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d),
      dow: i === 0 ? "Today" : fmt(d, { weekday: "short" }),
      num: fmt(d, { day: "numeric" }),
      month: fmt(d, { month: "short" }),
    };
  });
}

/** Whole minutes since the epoch: a stable snapshot that only changes once a minute. */
const currentMinute = () => Math.floor(Date.now() / 60_000);

/** Re-renders once a minute so past slots grey out while the page is open. */
function subscribeToMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

/** Minutes since midnight in store time. */
function storeMinutes(now: Date) {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).split(":").map(Number);
  return h * 60 + m;
}

function slotMinutes(slot: string) {
  const [, hh, mm, ap] = /^(\d+):(\d+) (AM|PM)$/.exec(slot)!;
  return ((Number(hh) % 12) + (ap === "PM" ? 12 : 0)) * 60 + Number(mm);
}

export default function BookingForm() {
  // Dates depend on the clock, so the server renders none (null) and the
  // client fills them in after hydration, keeping both first renders equal.
  const minuteStamp = useSyncExternalStore(subscribeToMinute, currentMinute, () => null);
  const days = useMemo(() => (minuteStamp === null ? null : nextSevenDays(new Date(minuteStamp * 60_000))), [minuteStamp]);
  const nowMinutes = minuteStamp === null ? 0 : storeMinutes(new Date(minuteStamp * 60_000));
  const [pickedDay, setDay] = useState(0);
  const [pickedSlot, setSlot] = useState<string | null>(null);
  const [visit, setVisit] = useState<(typeof VISIT_TYPES)[number]>("Eye test");
  const [wearsGlasses, setWearsGlasses] = useState<"Yes" | "No">("No");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Today's slots that start within 30 minutes (or already passed) can't be
  // picked; once the whole day is gone, tomorrow is selected instead.
  const todayFull = days !== null && SLOTS.every((sl) => slotMinutes(sl) <= nowMinutes + 30);
  const day = pickedDay === 0 && todayFull ? 1 : pickedDay;
  const isPast = (sl: string) => days !== null && day === 0 && slotMinutes(sl) <= nowMinutes + 30;
  const slot = pickedSlot && !isPast(pickedSlot) ? pickedSlot : null;

  const chosenDay = days?.[day];
  const summary = chosenDay ? `${visit} · ${chosenDay.dow === "Today" ? "Today" : `${chosenDay.dow} ${chosenDay.num} ${chosenDay.month}`}${slot ? ` at ${slot}` : ""}` : visit;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slot) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          preferred_date: chosenDay?.iso ?? null,
          preferred_time: slot,
          test_type: visit,
          wears_glasses: wearsGlasses,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    const whatsapp = `${WHATSAPP_URL}?text=${encodeURIComponent(`Hello Darshana Optical, I booked online: ${summary}. Name: ${name}, phone: ${phone}.`)}`;
    return (
      <div role="status" style={{ padding: "40px 10px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
        <span style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className={s.pulseRing} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#FFD3BA" }} />
          <span className={s.pop} style={{ position: "relative", width: 88, height: 88, borderRadius: "50%", background: "#0F7A50", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        </span>
        <h2 className={`${s.display} ${s.up}`} style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em" }}>
          You&apos;re booked!
        </h2>
        <p className={`${s.up} ${s.d1}`} style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
          {summary}. We&apos;ll call you shortly to confirm. See you at Salem Bypass Road, opposite Vasanth &amp; Co.
        </p>
        <div className={`${s.up} ${s.d2}`} style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillDark} ${s.btn}`} style={{ height: 50, padding: "0 20px", fontSize: 14, borderRadius: 16 }}>
            Get directions
          </a>
          <a href={whatsapp} target="_blank" rel="noreferrer" className={`${s.pill} ${s.btn}`} style={{ height: 50, padding: "0 20px", fontSize: 14, borderRadius: 16, background: "#0F7A50", color: "#FFFFFF" }}>
            Confirm on WhatsApp
          </a>
          <button type="button" onClick={() => setStatus("idle")} className={`${s.pill} ${s.chip}`} style={{ height: 50, padding: "0 20px", fontSize: 14, borderRadius: 16 }}>
            Change booking
          </button>
        </div>
      </div>
    );
  }

  const stepTitle = { margin: 0, fontSize: 18, fontWeight: 800 } as const;

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <legend style={{ ...stepTitle, marginBottom: 12 }}>1. Choose a day</legend>
        <div className={s.days}>
          {(days ?? Array.from({ length: 7 }, () => null)).map((d, i) => (
            <button
              key={d?.iso ?? i}
              type="button"
              className={s.chip}
              aria-pressed={day === i}
              aria-label={d ? `${d.dow} ${d.num} ${d.month}` : undefined}
              disabled={!d || (i === 0 && todayFull)}
              onClick={() => setDay(i)}
              style={{ borderRadius: 18, padding: "12px 2px", minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>{d?.dow ?? " "}</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{d?.num ?? " "}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <legend style={{ ...stepTitle, marginBottom: 12 }}>2. Pick a time</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
          {SLOTS.map((sl) => (
            <button
              key={sl}
              type="button"
              className={s.chip}
              aria-pressed={slot === sl}
              disabled={isPast(sl)}
              onClick={() => setSlot(sl)}
              style={{ height: 48, borderRadius: 14, fontSize: 14, fontWeight: 700 }}
            >
              {sl}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <legend style={{ ...stepTitle, marginBottom: 12 }}>3. Your details</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label className={s.field}>
            Full name
            <input type="text" name="name" autoComplete="name" required maxLength={120} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={s.field}>
            Mobile number
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              maxLength={20}
              pattern="[+0-9 \-]{7,20}"
              title="Enter a valid phone number"
              placeholder="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className={s.field}>
            <span>
              Email <small>(optional)</small>
            </span>
            <input type="email" name="email" autoComplete="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
        <div role="group" aria-label="Visit type" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VISIT_TYPES.map((t) => (
            <button key={t} type="button" className={s.chip} aria-pressed={visit === t} onClick={() => setVisit(t)} style={{ height: 44, padding: "0 16px", borderRadius: 14, fontSize: 13, fontWeight: 700 }}>
              {t}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Do you wear glasses now?" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, marginRight: 4 }}>Wear glasses now?</span>
          {(["Yes", "No"] as const).map((v) => (
            <button key={v} type="button" className={s.chip} aria-pressed={wearsGlasses === v} onClick={() => setWearsGlasses(v)} style={{ height: 44, padding: "0 18px", borderRadius: 14, fontSize: 13, fontWeight: 700 }}>
              {v}
            </button>
          ))}
        </div>
        <label className={s.field}>
          <span>
            Anything we should know? <small>(optional)</small>
          </span>
          <textarea name="notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </fieldset>

      {status === "error" && (
        <p role="alert" className={s.formError} style={{ margin: 0 }}>
          {slot ? `We couldn't save your booking. Check your connection and try again, or call ${PHONE_DISPLAY}.` : "Pick a time for your visit."}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "18px 20px", borderRadius: 22, background: "var(--peach)" }}>
        <strong aria-live="polite" style={{ fontSize: 15, color: "var(--orange-deep)" }}>
          {summary}
        </strong>
        <button
          type="submit"
          disabled={status === "sending"}
          className={`${s.pill} ${s.pillOrange} ${s.btn}`}
          style={{ height: 54, padding: "0 26px", borderRadius: 16, fontSize: 15, fontWeight: 800, boxShadow: "0 12px 26px rgba(253,90,5,.3)", opacity: status === "sending" ? 0.7 : 1 }}
        >
          {status === "sending" ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </form>
  );
}
