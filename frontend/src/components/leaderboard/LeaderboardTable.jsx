import AnimationState from '../ui/AnimationState'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import LeaderboardTableRow from './LeaderboardTableRow';
import LeaderboardSkeleton from './LeaderboardSkeleton';

// ── Sortable column header ────────────────────────────────────────────────
const SortTh = ({ label, field, sort, order, onSort, align = 'center', hide = '' }) => {
  const active = sort === field;
  const nextOrder = active && order === 'desc' ? 'asc' : 'desc';
  const Icon = active ? (order === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <th
      onClick={() => onSort(field, nextOrder)}
      className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none transition-colors duration-150 ${hide} ${active ? 'text-[var(--btn-primary-bg)]' : 'text-[var(--text-muted)]'} ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {label}
        <Icon size={12} className={active ? 'opacity-100' : 'opacity-45'} />
      </span>
    </th>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const LeaderboardTable = ({ users = [], loading, error, myUserId, currentUserStats, sort, order, onSort }) => {
  const thProps = { sort, order, onSort };

  if (error) {
    return (
      <AnimationState
        variant="error"
        title="Failed to load leaderboard"
        description={error}
      />
    );
  }

  if (!loading && !users.length) {
    return (
      <AnimationState
        variant="empty"
        title="No users found"
        description="Try adjusting your search or country filter."
      />
    );
  }

  return (
    <div className="overflow-x-auto mb-4">
      <table className="data-table-layout">
        <thead>
          <tr className="text-[var(--text-muted)]">
            <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
              Rank
            </th>
            <th className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider">
              User
            </th>
            <th className="hidden md:table-cell px-3.5 py-3 text-xs font-semibold uppercase tracking-wider">
              Country
            </th>
            <SortTh label="Rating" field="rating"    {...thProps} />
            <th className="hidden sm:table-cell px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-center">
              Battles
            </th>
            <th className="hidden sm:table-cell px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-center">
              Win %
            </th>
          </tr>
          <tr aria-hidden="true">
            <td colSpan={6} className="h-px bg-[var(--bg-overlay)] p-0 opacity-60" />
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <LeaderboardSkeleton />
          ) : (
            <>
              {currentUserStats && !users.some(u => u._id?.toString() === myUserId?.toString()) && (
                <LeaderboardTableRow
                  user={currentUserStats}
                  i="me"
                  isPinned={true}
                  myUserId={myUserId}
                  key="row-me-pinned"
                />
              )}
              {users.map((user, i) => (
                <LeaderboardTableRow
                  user={user}
                  i={i}
                  isPinned={false}
                  myUserId={myUserId}
                  key={`row-${user._id ?? i}-list`}
                />
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
