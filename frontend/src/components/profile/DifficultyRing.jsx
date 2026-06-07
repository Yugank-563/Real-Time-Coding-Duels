
const DifficultyRing = ({ difficulties, totalSubmissions }) => {
  const segs = [
    { label: 'Easy',   count: difficulties.Easy,   color: '#00b8a3' },
    { label: 'Medium', count: difficulties.Medium, color: '#ffc01e' },
    { label: 'Hard',   count: difficulties.Hard,   color: '#ff375f' },
  ];
  const total = segs.reduce((s, g) => s + g.count, 0);
  const R = 38, C = 2 * Math.PI * R;
  let off = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--auth-muted)',
                       textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Solved Problems
        </span>
        {totalSubmissions !== undefined && (
          <span style={{ fontSize: '0.7rem', color: 'var(--auth-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--auth-heading)' }}>
              {totalSubmissions.toLocaleString()}
            </span>{' '}submissions
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Ring */}
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100"
               style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r={R} fill="none"
                    stroke="var(--auth-input-border)" strokeWidth={7} />
            {total > 0 && segs.map((seg, i) => {
              const dash = (seg.count / total) * C;
              const el = (
                <circle key={i} cx="50" cy="50" r={R} fill="none"
                        stroke={seg.color} strokeWidth={7}
                        strokeDasharray={`${dash} ${C - dash}`}
                        strokeDashoffset={-off} strokeLinecap="round"
                        style={{ transition: 'all 0.55s ease' }} />
              );
              off += dash;
              return el;
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--auth-heading)',
                           lineHeight: 1, letterSpacing: '-0.02em' }}>{total}</span>
            <span style={{ fontSize: '0.58rem', color: 'var(--auth-muted)', fontWeight: 600,
                           textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>
              Solved
            </span>
          </div>
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {segs.map(seg => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: 44, fontSize: '0.72rem', fontWeight: 600, color: seg.color }}>
                {seg.label}
              </span>
              <div style={{ flex: 1, height: 4, background: 'var(--auth-input-border)',
                            borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: seg.color, borderRadius: 99,
                              width: `${total > 0 ? (seg.count/total)*100 : 0}%`,
                              transition: 'width 0.55s ease' }} />
              </div>
              <span style={{ width: 18, fontSize: '0.75rem', fontWeight: 700,
                             color: 'var(--auth-heading)', textAlign: 'right' }}>
                {seg.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultyRing;
