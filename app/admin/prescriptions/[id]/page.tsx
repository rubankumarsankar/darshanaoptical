'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import AdminLoader from '../../components/AdminLoader';
import { ArrowLeft, Printer, ShoppingCart } from 'lucide-react';

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

  if (loading || settingsLoading) return <AdminLoader label="Preparing prescription" />;
  if (!test) return <div className="adm-document-error">Prescription not found.</div>;

  const rows = [
    { eye: 'Right eye', short: 'OD', values: [test.re_sph, test.re_cyl, test.re_axis, test.re_add, test.re_pd] },
    { eye: 'Left eye', short: 'OS', values: [test.le_sph, test.le_cyl, test.le_axis, test.le_add, test.le_pd] },
  ];
  const address = [shop.address, shop.city, shop.state, shop.pincode].filter(Boolean).join(', ');

  return (
    <div className="adm-print-page adm-prescription-page" data-print-mode="prescription">
      <div className="adm-page-header adm-no-print">
        <Link href="/admin/eye-tests" className="adm-btn adm-btn-ghost adm-btn-sm">
          <ArrowLeft width={14} height={14} /> Eye Tests
        </Link>
        <div className="adm-prescription-screen-title">
          <div className="adm-page-title">Prescription</div>
          <div className="adm-page-sub">{test.customer_name} · {formatDate(test.test_date)}</div>
        </div>
        <div className="adm-prescription-actions">
          <button type="button" onClick={() => window.print()} className="adm-btn adm-btn-secondary adm-btn-sm">
            <Printer width={13} height={13} /> Print prescription
          </button>
          <Link href={`/admin/pos?customerId=${test.customer_id}`} className="adm-btn adm-btn-primary adm-btn-sm">
            <ShoppingCart width={13} height={13} /> Start sale
          </Link>
        </div>
      </div>

      <article className="adm-card adm-print-sheet print-section print-prescription adm-rx-sheet">
        <header className="adm-rx-letterhead">
          <div className="adm-rx-brand">
            <div className="adm-rx-logo"><Image src="/logo.png" alt="Darshana Optical logo" width={64} height={64} priority /></div>
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
                  {row.values.map((value, index) => <td key={index}>{display(value)}</td>)}
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
