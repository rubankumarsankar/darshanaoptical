'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { Shield, Store, Phone, MapPin, FileText, Lock } from 'lucide-react';

const PERMISSIONS_MATRIX = [
  { action: 'View Dashboard', admin: true, manager: true, staff: true },
  { action: 'View Reports', admin: true, manager: true, staff: false },
  { action: 'View Purchase Price', admin: true, manager: true, staff: false },
  { action: 'View Inventory Value', admin: true, manager: true, staff: false },
  { action: 'Add/Edit Products', admin: true, manager: true, staff: false },
  { action: 'Adjust Stock', admin: true, manager: true, staff: false },
  { action: 'Create Invoice', admin: true, manager: true, staff: true },
  { action: 'Receive Payments', admin: true, manager: true, staff: true },
  { action: 'Cancel Invoice', admin: true, manager: true, staff: false },
  { action: 'Apply Discount up to 5%', admin: true, manager: true, staff: true },
  { action: 'Apply Discount up to 15%', admin: true, manager: true, staff: false },
  { action: 'Apply Discount > 15%', admin: true, manager: false, staff: false },
  { action: 'Manage Suppliers', admin: true, manager: true, staff: false },
  { action: 'Add Expenses', admin: true, manager: true, staff: false },
  { action: 'Manage Staff', admin: true, manager: false, staff: false },
  { action: 'View Audit Logs', admin: true, manager: true, staff: false },
  { action: 'Change Settings', admin: true, manager: false, staff: false },
];

const SHOP_INFO = {
  name: 'Darshana Optical',
  phone: '088705 71536',
  address: 'Harur, Tamil Nadu, India',
  gst: 'Add GST number here',
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'shop' | 'permissions'>('shop');
  const [shop, setShop] = useState(SHOP_INFO);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Settings</div>
      </div>

      <div className="adm-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        <button className={`adm-tab${tab === 'shop' ? ' active' : ''}`} onClick={() => setTab('shop')}><Store width={13} height={13} style={{ marginRight: 6 }} />Shop Details</button>
        <button className={`adm-tab${tab === 'permissions' ? ' active' : ''}`} onClick={() => setTab('permissions')}><Shield width={13} height={13} style={{ marginRight: 6 }} />Role Permissions</button>
      </div>

      {tab === 'shop' && (
        <div style={{ maxWidth: 560 }}>
          <div className="adm-card">
            <div className="adm-card-header"><Store width={14} height={14} style={{ color: '#fc5a06' }} /><span className="adm-card-title">Shop Information</span></div>
            <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="adm-field">
                <label className="adm-label">Shop Name</label>
                <input className="adm-input" value={shop.name} onChange={(e) => setShop((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
                  <input className="adm-input" style={{ paddingLeft: 38 }} value={shop.phone} onChange={(e) => setShop((s) => ({ ...s, phone: e.target.value }))} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: 12, top: 12, width: 14, height: 14, color: '#94a3b8' }} />
                  <textarea className="adm-textarea" style={{ paddingLeft: 38 }} value={shop.address} onChange={(e) => setShop((s) => ({ ...s, address: e.target.value }))} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">GST Number</label>
                <div style={{ position: 'relative' }}>
                  <FileText style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
                  <input className="adm-input" style={{ paddingLeft: 38, fontFamily: 'monospace' }} value={shop.gst} onChange={(e) => setShop((s) => ({ ...s, gst: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} className="adm-btn adm-btn-primary">
                  {saved ? '✓ Saved!' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'permissions' && (
        <div>
          <div className="adm-alert adm-alert-info" style={{ marginBottom: 16 }}>
            <Lock width={14} height={14} style={{ flexShrink: 0 }} />
            <span>This is a read-only view of the permission matrix. Permissions are enforced server-side and cannot be changed from the UI in Phase 1.</span>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th style={{ textAlign: 'center' }}>Admin</th>
                  <th style={{ textAlign: 'center' }}>Manager</th>
                  <th style={{ textAlign: 'center' }}>Staff</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS_MATRIX.map((perm) => (
                  <tr key={perm.action}>
                    <td style={{ fontWeight: 500 }}>{perm.action}</td>
                    {[perm.admin, perm.manager, perm.staff].map((allowed, i) => (
                      <td key={i} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 16 }}>{allowed ? '✅' : '❌'}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
