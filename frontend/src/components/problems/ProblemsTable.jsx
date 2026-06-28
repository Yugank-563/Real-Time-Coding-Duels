import { useNavigate } from 'react-router-dom';
import { AnimationState } from '../index';
import '../../styles/auth.css'; // Ensure theme styles are applied

const DIFF_META = {
  EASY: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', label: 'Easy' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Medium' },
  HARD: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Hard' },
};

const diffMeta = (d = '') => DIFF_META[(d || '').toUpperCase()] || DIFF_META.EASY;

const ProblemsTable = ({ problems, loading, error, page = 1 }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ maxWidth: '100%', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--auth-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'left' }}>Title</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--auth-card)', borderRadius: '0.5rem' }}>
                <td style={{ padding: '1.25rem 1rem', borderRadius: '0.5rem 0 0 0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '24px', height: '1.25rem', background: 'var(--auth-input-bg)', borderRadius: '0.25rem', opacity: 0.5 }} className="animate-pulse" />
                    <div style={{ height: '1.25rem', width: '200px', background: 'var(--auth-input-bg)', borderRadius: '0.25rem', opacity: 0.5 }} className="animate-pulse" />
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', borderRadius: '0 0.5rem 0.5rem 0' }}>
                  <div style={{ height: '1.25rem', width: '60px', background: 'var(--auth-input-bg)', borderRadius: '0.25rem', opacity: 0.5, display: 'inline-block' }} className="animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return <AnimationState variant="error" description={error} />;
  }

  if (!problems || problems.length === 0) {
    return <AnimationState
      variant="empty"
      title="No Problems Found"
      description="No coding problems match your current criteria."
    />;
  }

  return (
    <div style={{ maxWidth: '100%', marginBottom: '2rem' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: 'var(--auth-muted)', fontSize: '0.85rem' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'left' }}>Title</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p, i) => {
            const diff = diffMeta(p.difficulty);
            return (
              <tr
                key={p._id || i}
                onClick={() => navigate(`/problems/${p.titleSlug}`)}
                style={{
                  cursor: 'pointer',
                  background: i % 2 === 0 ? 'transparent' : 'var(--auth-card)',
                  borderRadius: '0.5rem',
                  color: 'var(--auth-heading)'
                }}
                className="hover:bg-[var(--auth-input-bg)] transition-colors group"
              >
                <td style={{ padding: '1.25rem 1rem', fontSize: '0.95rem', fontWeight: 500, borderRadius: '0.5rem 0 0 0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--auth-muted)', fontSize: '0.85rem', minWidth: '24px' }}>
                      {(page - 1) * 20 + i + 1}.
                    </span>
                    {p.title}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', borderRadius: '0 0.5rem 0.5rem 0' }}>
                  <span style={{
                    color: diff.color,
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    {diff.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemsTable;
