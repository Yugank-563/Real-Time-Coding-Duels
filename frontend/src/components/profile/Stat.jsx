const Stat = ({ label, value, large }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--auth-muted)',
                   textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    <span style={{ fontSize: large ? '1.45rem' : '0.95rem', fontWeight: 700,
                   color: 'var(--auth-heading)', lineHeight: 1.2, letterSpacing: large ? '-0.02em' : 0 }}>
      {value}
    </span>
  </div>
);

export default Stat;
