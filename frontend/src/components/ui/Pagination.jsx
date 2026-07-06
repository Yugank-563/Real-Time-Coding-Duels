import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, setPage, label = 'items' }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total } = pagination;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-[0.85rem] text-[var(--text-muted)]">
        Page <span className="text-[var(--text-primary)] font-semibold">{page}</span> of {pages} ({total} {label})
      </div>
      
      <div className="flex gap-1.5">
        <button 
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`bg-[var(--bg-surface)] border border-[var(--bg-overlay)] px-2.5 py-1.5 rounded-md flex items-center transition-colors ${
            page === 1 ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed' : 'text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] cursor-pointer'
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {[...Array(pages)].map((_, i) => {
            const p = i + 1;
            // Simple logic: show first, last, and +/- 2 from current
            if (p === 1 || p === pages || (p >= page - 2 && p <= page + 2)) {
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-[0.85rem] transition-all border ${
                    isActive
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--btn-primary-bg)] font-bold'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--bg-overlay)] font-medium hover:bg-[var(--bg-overlay)]'
                  }`}
                >
                  {p}
                </button>
              );
            } else if (p === page - 3 || p === page + 3) {
              return <span key={p} className="text-[var(--text-muted)] px-1 self-end">...</span>;
            }
            return null;
          })}
        </div>

        <button 
          onClick={() => setPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          className={`bg-[var(--bg-surface)] border border-[var(--bg-overlay)] px-2.5 py-1.5 rounded-md flex items-center transition-colors ${
            page === pages ? 'text-[var(--text-muted)] opacity-50 cursor-not-allowed' : 'text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] cursor-pointer'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
