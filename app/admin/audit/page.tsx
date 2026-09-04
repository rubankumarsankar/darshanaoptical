'use client';

import { useEffect, useState } from 'react';
import { getStore } from '@/app/lib/admin/store';
import type { AuditLog } from '@/app/lib/admin/types';
import { Search } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { setLogs(getStore().auditLogs.slice(0, 100)); }, []);

  const filtered = logs.filter((l) => {
    const q = query.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.performedBy.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Audit Logs</div>
          <div className="adm-page-sub">System activity history (last 100 entries)</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="adm-search-wrap" style={{ maxWidth: 360 }}>
          <Search />
          <input className="adm-input" placeholder="Search logs…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Time</th><th>Action</th><th>Details</th><th>Performed By</th><th>Role</th></tr></thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: '#94a3b8' }}>
                  {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}<br />
                  <span style={{ color: '#cbd5e1' }}>{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: '#475569', fontWeight: 600 }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: '#475569', maxWidth: 380 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</div>
                </td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{log.performedBy}</td>
                <td><span className={`adm-badge ${log.performedByRole === 'admin' ? 'adm-badge-danger' : log.performedByRole === 'manager' ? 'adm-badge-warning' : 'adm-badge-info'}`} style={{ textTransform: 'capitalize' }}>{log.performedByRole}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
