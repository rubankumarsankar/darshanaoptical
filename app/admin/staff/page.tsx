'use client';

import { useEffect, useState } from 'react';
import { getStore } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { AdminUser } from '@/app/lib/admin/types';
import { User, Phone, Mail, Shield } from 'lucide-react';

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<AdminUser[]>([]);

  useEffect(() => { setStaff(getStore().staff); }, []);

  const ROLE_COLORS: Record<string, string> = { admin: 'adm-badge-danger', manager: 'adm-badge-warning', staff: 'adm-badge-info' };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Staff Management</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {staff.map((s) => (
          <div key={s.id} className="adm-card">
            <div className="adm-card-body">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {s.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className={`adm-badge ${ROLE_COLORS[s.role] ?? 'adm-badge-gray'}`} style={{ textTransform: 'capitalize' }}>{s.role}</span>
                    <span className={`adm-badge ${s.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>{s.status}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone width={13} height={13} style={{ color: '#94a3b8' }} /> {s.phone}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User width={13} height={13} style={{ color: '#94a3b8' }} /> {s.email}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>Joined: {new Date(s.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-alert adm-alert-info" style={{ marginTop: 20 }}>
        <Shield width={14} height={14} style={{ flexShrink: 0 }} />
        <span>Staff accounts are managed through the authentication system. Contact your system administrator to add or modify staff roles.</span>
      </div>
    </div>
  );
}
