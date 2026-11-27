interface AdminLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

/** Calm loading state in the admin's colours; needs no stylesheet. */
export default function AdminLoader({ label = 'Loading', fullScreen = false }: AdminLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: fullScreen ? '100dvh' : 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: fullScreen ? '#232328' : 'transparent',
        color: fullScreen ? '#FFFFFF' : '#1F2024',
        fontFamily: 'inherit',
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 44, height: 44, borderRadius: '50%', border: '5px solid rgba(253,90,5,.25)', borderTopColor: '#FD5A05', animation: 'adm-spin 0.9s linear infinite' }}
      />
      <strong style={{ fontSize: 17 }}>{label}</strong>
      <style>{'@keyframes adm-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){[style*="adm-spin"]{animation:none!important}}'}</style>
    </div>
  );
}
