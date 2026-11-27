'use client';

import '../../admin.css';

import { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import AdminLoader from '../../components/AdminLoader';
import { ArrowLeft, MessageCircle, Printer, ShoppingCart } from 'lucide-react';
import s from '../../_ui/simple.module.css';
import { EmptyState, WhatsAppButton } from '../../_ui/parts';

const FALLBACK_SHOP = {
  shop_name: 'Darshana Optical',
  tagline: 'Quality eye care for a better life',
  phone: '88705 71536',
  email: 'darshanaoptical31@gmail.com',
  address: 'TVK Nagar, Salem Bypass Road, opposite Vasanth & Co',
  city: 'Harur',
  state: 'Tamil Nadu',
  pincode: '636903',
};

function display(value: unknown) {
  return value === null || value === undefined || value === '' ? 'Not recorded' : String(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading } = useAdminFetch<{ eyeTest: any }>(`/api/admin/eye-tests/${id}`);
  const { data: settingsData, loading: settingsLoading } = useAdminFetch<{ settings: any }>('/api/admin/settings');
  const test = data?.eyeTest;
  const shop = { ...FALLBACK_SHOP, ...(settingsData?.settings ?? {}) };

  // "Print prescription" in the simple admin links here with ?print=1.
  const [autoPrint] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('print') === '1');
  const printed = useRef(false);
  const ready = !!test && !settingsLoading;
  useEffect(() => {
    if (!autoPrint || !ready || printed.current) return;
    const t = window.setTimeout(() => {
      printed.current = true;
      window.print();
    }, 150);
    return () => window.clearTimeout(t);
  }, [autoPrint, ready]);

  if (loading || settingsLoading) return <AdminLoader label="Preparing prescription" />;
  if (!test) return <EmptyState>This prescription could not be found.</EmptyState>;

  const power = (sph: string | null, cyl: string | null, axis: string | null, add: string | null) =>
    [sph && `SPH ${sph}`, cyl && `CYL ${cyl}`, axis && `Axis ${axis}`, add && `ADD ${add}`].filter(Boolean).join(', ') || 'no power';
  const whatsappText = [
    `Hello ${test.customer_name}, here is your prescription from ${shop.shop_name} (${formatDate(test.test_date)}).`,
    `Right eye: ${power(test.re_sph, test.re_cyl, test.re_axis, test.re_add)}`,
    `Left eye: ${power(test.le_sph, test.le_cyl, test.le_axis, test.le_add)}`,
    test.recommendation ? `We suggest: ${test.recommendation}.` : '',
  ].filter(Boolean).join('\n');

  const rows = [
    { eye: 'Right eye', short: 'OD', values: [test.re_sph, test.re_cyl, test.re_axis, test.re_add, test.re_pd] },
    { eye: 'Left eye', short: 'OS', values: [test.le_sph, test.le_cyl, test.le_axis, test.le_add, test.le_pd] },
  ];
  const address = [shop.address, shop.city, shop.state, shop.pincode].filter(Boolean).join(', ');

  return (
    <div className="adm-print-page adm-prescription-page" data-print-mode="prescription">
      <div className="adm-no-print" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        <Link href={`/admin/customers?q=${encodeURIComponent(test.customer_phone ?? test.customer_name)}`} style={{ fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft width={18} height={18} /> {test.customer_name}
        </Link>
        <div>
          <h1 className={s.h1}>Prescription</h1>
          <p className={s.sub}>
            {test.customer_name} · tested {formatDate(test.test_date)}
            {test.tested_by ? ` by ${test.tested_by}` : ''}
          </p>
        </div>
        <div className={s.row} style={{ gap: 10 }}>
          <Link href={`/admin/sale?customer=${encodeURIComponent(test.customer_id)}&eyeTest=${encodeURIComponent(test.id)}`} className={`${s.btn} ${s.btnPrimary}`}>
            <ShoppingCart width={18} height={18} /> Start sale with this power
          </Link>
          <button type="button" onClick={() => window.print()} className={`${s.btn} ${s.btnDark}`}>
            <Printer width={18} height={18} /> Print prescription
          </button>
          <WhatsAppButton phone={test.customer_phone} text={whatsappText} className={`${s.btn} ${s.btnGreen}`}>
            <MessageCircle width={18} height={18} /> Send on WhatsApp
          </WhatsAppButton>
        </div>
      </div>

      <article className="adm-card adm-print-sheet print-section print-prescription adm-rx-sheet">
        <header className="adm-rx-letterhead">
          <div className="adm-rx-brand">
            <div className="adm-rx-logo"><Image src={shop.logo_url || '/logo.png'} alt="Darshana Optical logo" width={64} height={64} priority unoptimized={/^https?:/.test(shop.logo_url ?? '')} style={{ objectFit: 'contain' }} /></div>
            <div>
              <h1>{shop.shop_name}</h1>
              <p>{shop.tagline}</p>
            </div>
          </div>
          <div className="adm-rx-contact">
            <strong>Optical care and eye testing</strong>
            <span>{address}</span>
            <span>{shop.phone} · {shop.email}</span>
          </div>
        </header>

        <div className="adm-rx-title-row">
          <div>
            <span className="adm-rx-kicker">Clinical document</span>
            <h2>Vision Prescription</h2>
          </div>
          <div className="adm-rx-reference">
            <span>Prescription ID</span>
            <strong>{String(test.id).slice(0, 8).toUpperCase()}</strong>
          </div>
        </div>

        <section className="adm-rx-patient" aria-label="Patient details">
          <div><span>Patient name</span><strong>{test.customer_name}</strong></div>
          <div><span>Phone number</span><strong>{display(test.customer_phone)}</strong></div>
          <div><span>Test date</span><strong>{formatDate(test.test_date)}</strong></div>
          <div><span>Examined by</span><strong>{display(test.tested_by)}</strong></div>
        </section>

        <section className="adm-rx-measurements" aria-labelledby="rx-values-title">
          <div className="adm-rx-section-heading">
            <h3 id="rx-values-title">Prescription values</h3>
            <span>All measurements are recorded from the eye examination.</span>
          </div>
          <div className="adm-prescription-grid-wrap">
            <table className="adm-prescription-grid">
              <thead><tr><th>Eye</th><th>SPH</th><th>CYL</th><th>AXIS</th><th>ADD</th><th>PD</th></tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.short}>
                  <td><strong>{row.eye}</strong><span>{row.short}</span></td>
                  {row.values.map((value, index) => <td key={index}>{value === null || value === undefined || value === '' ? '—' : String(value)}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="adm-rx-secondary">
          <div className="adm-rx-acuity">
            <h3>Visual acuity</h3>
            <div><span>Right eye</span><strong>{display(test.visual_acuity_right)}</strong></div>
            <div><span>Left eye</span><strong>{display(test.visual_acuity_left)}</strong></div>
          </div>
          <div className="adm-rx-guidance">
            <div><span>Recommendation</span><p>{display(test.recommendation)}</p></div>
            <div><span>Clinical notes</span><p>{display(test.notes)}</p></div>
          </div>
        </section>

        <footer className="adm-rx-footer">
          <div className="adm-rx-signature"><span>Optometrist / authorised signature</span></div>
          <div className="adm-rx-footer-copy">
            <strong>{shop.shop_name}</strong>
            <span>{address}</span>
            <span>darshanaoptical.com</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
