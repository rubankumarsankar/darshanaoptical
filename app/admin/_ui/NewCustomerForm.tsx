'use client';

import { useState, type FormEvent } from 'react';
import { adminPost } from '@/app/lib/admin/api';
import s from './simple.module.css';
import { ErrorNote } from './parts';

export interface NewCustomer {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  last_visit?: string | null;
}

/** Name + phone only. Used by New sale and Customers. */
export default function NewCustomerForm({ initial = '', onCreated, onCancel }: { initial?: string; onCreated: (c: NewCustomer) => void; onCancel: () => void }) {
  const looksLikePhone = /^\d[\d\s-]*$/.test(initial.trim());
  const [name, setName] = useState(looksLikePhone ? '' : initial.trim());
  const [phone, setPhone] = useState(looksLikePhone ? initial.replace(/\D/g, '') : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await adminPost<{ customer: NewCustomer }>('/api/admin/customers', { name: name.trim(), phone: phone.replace(/\D/g, '') });
      onCreated(res.customer);
    } catch (err: any) {
      // Turn the validator's wording into plain words.
      const msg = String(err.message ?? '');
      setError(/phone/.test(msg) ? 'Enter a 10-digit mobile number, like 98400 12345.' : /name/.test(msg) ? 'Enter the customer’s name using letters only.' : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.stack} style={{ gap: 14, padding: 20, borderRadius: 22, background: 'var(--page)' }}>
      <strong style={{ fontSize: 18 }}>New customer</strong>
      <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label className={s.field}>
          Name
          <input className={`${s.input} ${s.inputOnPage}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required minLength={2} maxLength={255} />
        </label>
        <label className={s.field}>
          Mobile number
          <input className={`${s.input} ${s.inputOnPage}`} type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98400 12345" required />
        </label>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className={s.row} style={{ gap: 10 }}>
        <button type="submit" className={`${s.btn} ${s.btnDark}`} disabled={busy}>
          {busy ? 'Saving…' : 'Save customer'}
        </button>
        <button type="button" className={`${s.btn} ${s.btnLight}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

