import '../../styles/auth.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const ProblemsPagination = ({ pagination, setPage }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--auth-muted)' }}>
        Showing page <span style={{ color: 'var(--auth-heading)', fontWeight: 600 }}>{page}</span> of {pages} ({total} problems)
      </div>
      
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button 
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            background: 'var(--auth-card)',
            border: '1px solid var(--auth-card-border)',
            color: page === 1 ? 'var(--auth-muted)' : 'var(--auth-heading)',
            opacity: page === 1 ? 0.5 : 1,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            padding: '0.4rem 0.6rem',
            borderRadius: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.2s'
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          {[...Array(pages)].map((_, i) => {
            const p = i + 1;
            // Simple logic: show first, last, and +/- 2 from current
            if (p === 1 || p === pages || (p >= page - 2 && p <= page + 2)) {
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    background: isActive ? 'var(--auth-btn)' : 'var(--auth-card)',
                    color: isActive ? 'var(--auth-btn-text)' : 'var(--auth-heading)',
                    border: `1px solid ${isActive ? 'var(--auth-btn)' : 'var(--auth-card-border)'}`,
                    borderRadius: '0.4rem',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {p}
                </button>
              );
            } else if (p === page - 3 || p === page + 3) {
              return <span key={p} style={{ color: 'var(--auth-muted)', padding: '0 0.2rem', alignSelf: 'flex-end' }}>...</span>;
            }
            return null;
          })}
        </div>

        <button 
          onClick={() => setPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          style={{
            background: 'var(--auth-card)',
            border: '1px solid var(--auth-card-border)',
            color: page === pages ? 'var(--auth-muted)' : 'var(--auth-heading)',
            opacity: page === pages ? 0.5 : 1,
            cursor: page === pages ? 'not-allowed' : 'pointer',
            padding: '0.4rem 0.6rem',
            borderRadius: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.2s'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProblemsPagination;
