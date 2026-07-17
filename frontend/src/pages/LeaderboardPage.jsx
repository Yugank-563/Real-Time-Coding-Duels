import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../features/index';
import { selectUser } from '../features/index';
import { useDocumentTitle } from '../hooks/index';
import { LeaderboardTable, LeaderboardFilter, Pagination } from '../components/index';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
    useDocumentTitle('Leaderboard');

  const dispatch    = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { users, total, page: statePage, totalPages, loading, error, countries, currentUserLeaderboard } =
    useSelector((state) => state.leaderboard);
  const currentUser = useSelector(selectUser);
  const myUserId    = currentUser?._id || currentUser?.id;

  // ── URL → state ────────────────────────────────────────────────────
  const page    = parseInt(searchParams.get('page'))    || 1;
  const sort    = searchParams.get('sort')              || 'rating';
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
        (key === 'sort'  && val === 'rating')      ||
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
    <div className="w-full flex flex-col">

      {/* ── Page Header ── */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="icon-box">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <h1 className="text-[1.75rem] font-extrabold m-0 text-[var(--text-primary)] tracking-[-0.02em]">
            Leaderboard
          </h1>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[0.9rem] text-[var(--text-muted)] m-0">
            Top rated competitive coders ranked by rating.
          </p>
          {total > 0 && (
            <span className="text-[0.8rem] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--bg-overlay)] px-3 py-1 rounded-full">
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
  );
};

export default LeaderboardPage;
