import { useNavigate } from 'react-router-dom';
import AnimationState from '../ui/AnimationState';

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
      <div className="max-w-full mb-8">
        <table className="data-table-layout">
          <thead>
            <tr className="text-[var(--text-muted)] text-[0.85rem]">
              <th className="px-4 py-3 font-semibold text-left">Title</th>
              <th className="px-4 py-3 font-semibold text-right">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className={`rounded-lg ${i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-surface)]'}`}>
                <td className="p-5 rounded-l-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-5 bg-[var(--bg-elevated)] rounded opacity-50 animate-pulse" />
                    <div className="h-5 w-[200px] bg-[var(--bg-elevated)] rounded opacity-50 animate-pulse" />
                  </div>
                </td>
                <td className="p-5 text-right rounded-r-lg">
                  <div className="h-5 w-[60px] bg-[var(--bg-elevated)] rounded opacity-50 inline-block animate-pulse" />
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
    <div className="max-w-full mb-8">
      <table className="data-table-layout">
        <thead>
          <tr className="text-[var(--text-muted)] text-[0.85rem]">
            <th className="px-4 py-3 font-semibold text-left">Title</th>
            <th className="px-4 py-3 font-semibold text-right">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p, i) => {
            const diff = diffMeta(p.difficulty);
            return (
              <tr
                key={p._id || i}
                onClick={() => navigate(`/problems/${p.titleSlug}`)}
                className={`cursor-pointer rounded-lg text-[var(--text-primary)] transition-colors group ${i % 2 === 0 ? 'bg-transparent' : 'bg-[var(--bg-surface)]'}`}
              >
                <td className="p-5 font-medium text-[0.95rem] rounded-l-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-muted)] text-[0.85rem] min-w-[24px]">
                      {(page - 1) * 20 + i + 1}.
                    </span>
                    {p.title}
                  </div>
                </td>
                <td className="p-5 text-right rounded-r-lg">
                  <span 
                    className="text-[0.85rem] font-medium"
                    style={{ color: diff.color }}
                  >
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
