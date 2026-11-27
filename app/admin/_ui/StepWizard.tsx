'use client';

import type { ReactNode } from 'react';
import s from './simple.module.css';

interface StepWizardProps {
  steps: readonly string[];
  /** 0-based index of the step on screen. */
  current: number;
  /** Whether the visible step's input is complete; Next stays disabled until it is. */
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  /** Label for the last step's button, e.g. "Save bill". */
  finishLabel: string;
  busy?: boolean;
  children: ReactNode;
}

/** Progress bar on top, one step's content, and big Back / Next buttons. */
export default function StepWizard({ steps, current, canNext, onBack, onNext, finishLabel, busy, children }: StepWizardProps) {
  const last = current === steps.length - 1;
  return (
    <>
      <ol aria-label="Steps" className={s.progress} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((label, i) => (
          <li
            key={label}
            className={s.progressStep}
            data-state={i < current ? 'done' : i === current ? 'current' : 'todo'}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className={s.progressBar} />
            <span>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <section className={`${s.card} ${s.wizardPanel}`} aria-label={steps[current]}>
        <div key={current} className={s.slideIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {children}
        </div>
      </section>

      <div className={s.wizardNav}>
        <button type="button" className={`${s.btn} ${s.btnBig} ${s.btnLight}`} onClick={onBack} style={{ visibility: current === 0 ? 'hidden' : 'visible' }}>
          ← Back
        </button>
        <button type="button" className={`${s.btn} ${s.btnBig} ${s.btnPrimary}`} onClick={onNext} disabled={!canNext || busy}>
          {busy ? 'Saving…' : last ? `${finishLabel} ✓` : 'Next →'}
        </button>
      </div>
    </>
  );
}
