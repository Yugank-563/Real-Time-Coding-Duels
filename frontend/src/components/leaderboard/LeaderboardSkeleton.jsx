import '../../styles/auth.css';

const LeaderboardSkeleton = () => {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <tr
          key={i}
          style={{
            background: i % 2 !== 0 ? 'transparent' : 'var(--auth-card)',
            borderRadius: '0.5rem',
          }}
        >
          {/* Rank */}
          <td style={{ padding: '0.9rem 0.9rem', borderRadius: '0.5rem 0 0 0.5rem', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, background: 'var(--auth-input-bg)', borderRadius: '50%', opacity: 0.5, display: 'inline-block' }} className="animate-pulse" />
          </td>
          {/* Player */}
          <td style={{ padding: '0.9rem 0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--auth-input-bg)', opacity: 0.5, flexShrink: 0 }} className="animate-pulse" />
              <div style={{ width: 110, height: 13, background: 'var(--auth-input-bg)', borderRadius: 4, opacity: 0.5 }} className="animate-pulse" />
            </div>
          </td>
          {/* Country */}
          <td style={{ padding: '0.9rem 0.9rem' }} className="hidden md:table-cell">
            <div style={{ width: 64, height: 13, background: 'var(--auth-input-bg)', borderRadius: 4, opacity: 0.5 }} className="animate-pulse" />
          </td>
          {/* Rating */}
          <td style={{ padding: '0.9rem 0.9rem', textAlign: 'center' }}>
            <div style={{ width: 44, height: 13, background: 'var(--auth-input-bg)', borderRadius: 4, opacity: 0.5, display: 'inline-block' }} className="animate-pulse" />
          </td>
          {/* Battles */}
          <td style={{ padding: '0.9rem 0.9rem', textAlign: 'center' }} className="hidden sm:table-cell">
            <div style={{ width: 28, height: 13, background: 'var(--auth-input-bg)', borderRadius: 4, opacity: 0.5, display: 'inline-block' }} className="animate-pulse" />
          </td>
          {/* Win Rate */}
          <td style={{ padding: '0.9rem 0.9rem', textAlign: 'center', borderRadius: '0 0.5rem 0.5rem 0' }} className="hidden sm:table-cell">
            <div style={{ width: 40, height: 13, background: 'var(--auth-input-bg)', borderRadius: 4, opacity: 0.5, display: 'inline-block' }} className="animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
};

export default LeaderboardSkeleton;
