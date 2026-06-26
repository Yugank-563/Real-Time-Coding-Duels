import { AnimationState } from '../index';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import LeaderboardTableRow from './LeaderboardTableRow';
import LeaderboardSkeleton from './LeaderboardSkeleton';
import '../../styles/auth.css';

// ── Sortable column header ────────────────────────────────────────────────
const SortTh = ({ label, field, sort, order, onSort, align = 'center', hide = '' }) => {
  const active = sort === field;
  const nextOrder = active && order === 'desc' ? 'asc' : 'desc';
  const Icon = active ? (order === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <th
      onClick={() => onSort(field, nextOrder)}
      className={hide}
      style={{
        padding: '0.7rem 0.9rem', fontWeight: 600,
        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
        color: active ? 'var(--auth-btn)' : 'var(--auth-muted)',
        textAlign: align, cursor: 'pointer', userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'color 0.15s',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start') }}>
        {label}
        <Icon size={12} style={{ opacity: active ? 1 : 0.45 }} />
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
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate', borderSpacing: '0 4px',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ color: 'var(--auth-muted)' }}>
            <th style={{
              padding: '0.7rem 0.9rem', fontWeight: 600,
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--auth-muted)', whiteSpace: 'nowrap',
            }}>
              Rank
            </th>
            <th style={{
              padding: '0.7rem 0.9rem', fontWeight: 600,
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'var(--auth-muted)',
            }}>
              User
            </th>
            <th
              className="hidden md:table-cell"
              style={{
                padding: '0.7rem 0.9rem', fontWeight: 600,
                fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--auth-muted)',
              }}
            >
              Country
            </th>
            <SortTh label="Rating" field="rank"    {...thProps} />
            <th className="hidden sm:table-cell" style={{ padding: '0.7rem 0.9rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Battles
            </th>
            <th className="hidden sm:table-cell" style={{ padding: '0.7rem 0.9rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
              Win %
            </th>
          </tr>
          <tr aria-hidden="true">
            <td colSpan={6} style={{ height: '1px', background: 'var(--auth-card-border)', padding: 0, opacity: 0.6 }} />
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
