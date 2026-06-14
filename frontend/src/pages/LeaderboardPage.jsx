import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../features/index';
import { selectUser } from '../features/index';
import { useTheme, useDocumentTitle } from '../hooks/index';
import { LeaderboardTable, LeaderboardFilter, Pagination } from '../components/index';
import '../styles/auth.css';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
  const { theme } = useTheme();
  useDocumentTitle('Leaderboard');

  const dispatch    = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { users, total, page: statePage, totalPages, loading, error, countries, currentUserLeaderboard } =
    useSelector((state) => state.leaderboard);
  const currentUser = useSelector(selectUser);
  const myUserId    = currentUser?._id || currentUser?.id;

  // ── URL → state ────────────────────────────────────────────────────
  const page    = parseInt(searchParams.get('page'))    || 1;
  const sort    = searchParams.get('sort')              || 'rank';
  const order   = searchParams.get('order')             || 'desc';
  const country = searchParams.get('country')           || 'ALL';

  // Local debounced search (clears on refresh)
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ── URL updater ────────────────────────────────────────────────────
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      const isDefault =
        val === '' ||
        val === 'ALL' ||
        (key === 'page'  && Number(val) === 1)  ||
        (key === 'sort'  && val === 'rank')      ||
        (key === 'order' && val === 'desc');
      if (isDefault) params.delete(key);
      else           params.set(key, String(val));
    });
    setSearchParams(params);
  };

  const setPage    = (p) => updateParams({ page: p });
  const setCountry = (c) => updateParams({ country: c, page: 1 });
  const onSort     = (field, dir) => updateParams({ sort: field, order: dir, page: 1 });

  // Debounce search update
  useEffect(() => {
    const id = setTimeout(() => {
      if (debouncedSearch !== localSearch) {
        setDebouncedSearch(localSearch);
        updateParams({ page: 1 }); // reset to page 1 on new search
      }
    }, 400);
    return () => clearTimeout(id);
  }, [localSearch, debouncedSearch]); // eslint-disable-line

  // Clear legacy search params from URL on refresh
  useEffect(() => {
    if (searchParams.has('search')) {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      setSearchParams(params, { replace: true });
    }
  }, []); // eslint-disable-line

  // Fetch when URL params change
  useEffect(() => {
    dispatch(fetchLeaderboard({
      page, sort, order,
      search:  debouncedSearch,
      country: country === 'ALL' ? '' : country,
      limit:   20,
    }));
  }, [dispatch, page, sort, order, debouncedSearch, country]); // eslint-disable-line

  const pagination = {
    page:  statePage || page,
    pages: totalPages || 1,
    total,
  };

  return (
    <div
      className="auth-page-bg"
      data-auth-theme={theme}
      style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '1rem 0',
        display: 'block',
        overflowY: 'auto',
      }}
    >
      <div className="w-full">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '0.5rem',
              background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}>
              <Trophy size={20} color="var(--auth-accent)" />
            </div>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 800, margin: 0,
              color: 'var(--auth-heading)', letterSpacing: '-0.02em',
            }}>
              Leaderboard
            </h1>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--auth-muted)', margin: 0 }}>
              Top rated competitive coders ranked by Elo rating.
            </p>
            {total > 0 && (
              <span style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--auth-muted)',
                background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)',
                padding: '0.25rem 0.75rem', borderRadius: '9999px',
              }}>
                {total.toLocaleString()} users
              </span>
            )}
          </div>
        </div>

        {/* ── Filter Row ── */}
        <LeaderboardFilter
          search={localSearch}
          setSearch={setLocalSearch}
          country={country}
          setCountry={setCountry}
          countries={countries}
        />

        {/* ── Table ── */}
        <LeaderboardTable
          users={users}
          currentUserStats={currentUserLeaderboard}
          loading={loading}
          error={error}
          myUserId={myUserId}
          sort={sort}
          order={order}
          onSort={onSort}
        />

        {/* ── Pagination ── */}
        {!loading && !error && (
          <Pagination pagination={pagination} setPage={setPage} label="users" />
        )}

      </div>
    </div>
  );
};

export default LeaderboardPage;
