'use client';

// Small shared building blocks for the simple admin screens.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { waLink } from '@/app/lib/admin/simple';
import s from './simple.module.css';

// ─── BigActionTile ────────────────────────────────────────────────────────────

export function BigActionTile({ href, title, sub, icon, primary }: { href: string; title: string; sub: string; icon: ReactNode; primary?: boolean }) {
  return (
    <Link href={href} className={`${s.actionTile} ${s.tap} ${s.up} ${primary ? s.actionTilePrimary : ''}`}>
      <span className={s.actionRing}>{icon}</span>
      <span>
        <span className={s.actionTitle}>{title}</span>
        <span className={s.actionSub}>{sub}</span>
      </span>
    </Link>
  );
}

// ─── MoneyStat ────────────────────────────────────────────────────────────────

export function MoneyStat({ label, value, note, href, warm }: { label: string; value: string; note?: string; href?: string; warm?: boolean }) {
  const body = (
    <>
      <span className={s.statLabel}>{label}</span>
      <strong className={s.statValue}>{value}</strong>
      {note && <span className={s.statNote}>{note}</span>}
    </>
  );
  const cls = `${s.stat} ${warm ? s.statWarm : ''}`;
  return href ? (
    <Link href={href} className={`${cls} ${s.tap}`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// ─── AttentionRow ─────────────────────────────────────────────────────────────

export type AttentionTone = 'late' | 'now' | 'ready' | 'low';
const DOTS: Record<AttentionTone, string> = { late: '#D4351C', now: '#FD5A05', ready: '#0F7A50', low: '#C9A300' };

export function AttentionRow({ text, action, href, tone }: { text: string; action: string; href: string; tone: AttentionTone }) {
  return (
    <div className={`${s.attention} ${s.up}`}>
      <span className={s.attentionDot} style={{ background: DOTS[tone] }} aria-hidden />
      <span className={s.attentionText}>{text}</span>
      <Link href={href} className={`${s.btn} ${s.btnDark}`} style={{ minHeight: 50, fontSize: 15 }}>
        {action}
      </Link>
    </div>
  );
}

// ─── StatusTag ────────────────────────────────────────────────────────────────

export function StatusTag({ tone = 'neutral', children }: { tone?: 'neutral' | 'late' | 'good' | 'orange'; children: ReactNode }) {
  const cls = { neutral: s.tagNeutral, late: s.tagLate, good: s.tagGood, orange: s.tagOrange }[tone];
  return <span className={`${s.tag} ${cls}`}>{children}</span>;
}

// ─── ChoiceCard ───────────────────────────────────────────────────────────────

interface ChoiceCardProps {
  title: ReactNode;
  sub?: ReactNode;
  selected: boolean;
  onSelect: () => void;
  /** Radio cards (one of several) show a dot; toggle cards use aria-pressed. */
  radio?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}

export function ChoiceCard({ title, sub, selected, onSelect, radio, leading, trailing, disabled }: ChoiceCardProps) {
  return (
    <button
      type="button"
      className={s.choice}
      onClick={onSelect}
      disabled={disabled}
      {...(radio ? { role: 'radio', 'aria-checked': selected } : { 'aria-pressed': selected })}
    >
      {radio && <span className={s.radioDot} aria-hidden />}
      {leading}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className={s.choiceTitle}>{title}</span>
        {sub && <span className={s.choiceSub}>{sub}</span>}
      </span>
      {trailing}
    </button>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  format?: (v: number) => string;
}

export function Stepper({ value, onChange, min = 0, max = Number.POSITIVE_INFINITY, step = 1, label, format }: StepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <span className={s.stepper} role="group" aria-label={label}>
      <button type="button" className={s.stepperBtn} aria-label={`Less ${label}`} disabled={value <= min} onClick={() => onChange(clamp(value - step))}>
        −
      </button>
      <span className={s.stepperValue} aria-live="polite">
        {format ? format(value) : value}
      </span>
      <button type="button" className={s.stepperBtn} aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(clamp(value + step))}>
        +
      </button>
    </span>
  );
}

// ─── WhatsAppButton ───────────────────────────────────────────────────────────

/** Opens a wa.me chat with the text pre-filled. Renders nothing for a bad number. */
export function WhatsAppButton({ phone, text, children, className }: { phone: string | null | undefined; text: string; children: ReactNode; className?: string }) {
  const href = waLink(phone, text);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className ?? `${s.btn} ${s.btnGreen}`}>
      {children}
    </a>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={s.empty}>{children}</div>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className={s.error}>
      {children}
    </p>
  );
}

// ─── DoneScreen ───────────────────────────────────────────────────────────────

export function DoneScreen({ title, detail, children }: { title: string; detail?: ReactNode; children?: ReactNode }) {
  return (
    <div className={s.done} role="status">
      <span className={`${s.doneMark} ${s.pop}`}>
        <svg aria-hidden="true" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path className={s.tick} d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <h2 className={s.h1}>{title}</h2>
      {detail && <p style={{ margin: 0, fontSize: 18, color: 'var(--muted)', maxWidth: 560 }}>{detail}</p>}
      {children && <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>{children}</div>}
    </div>
  );
}

// ─── PageHead ─────────────────────────────────────────────────────────────────

export function PageHead({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className={s.pageHead}>
      <div>
        <h1 className={s.h1}>{title}</h1>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}
