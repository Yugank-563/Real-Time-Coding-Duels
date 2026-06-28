import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from '../features/index';
import { useTheme, useDocumentTitle } from '../hooks/index';
import '../styles/auth.css';
import { BookOpen } from 'lucide-react';
import { ProblemsFilter, ProblemsTable, Pagination } from '../components/index';

import { PROBLEM_TOPICS } from '../utils/index';

const ProblemsPage = () => {
  const { theme } = useTheme();
  useDocumentTitle('Problems');

  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { items: problems, pagination, loading, error } = useSelector((state) => state.problems);

  // Read from URL, provide defaults
  const page = parseInt(searchParams.get('page')) || 1;
  const difficulty = searchParams.get('difficulty') || 'ALL';
  const tag = searchParams.get('tag') || 'ALL';

  // Local state for debounced search input (clears on refresh)
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Update URL helper
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === '' || newParams[key] === 'ALL' || (key === 'page' && newParams[key] === 1)) {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
    setSearchParams(params);
  };

  const setPage = (newPage) => updateParams({ page: newPage });
  const setDifficulty = (newDiff) => updateParams({ difficulty: newDiff, page: 1 });
  const setTag = (newTag) => updateParams({ tag: newTag, page: 1 });

  // Debounce search update
  useEffect(() => {
    const delay = setTimeout(() => {
      if (debouncedSearch !== localSearch) {
        setDebouncedSearch(localSearch);
        updateParams({ page: 1 }); // reset to page 1 on new search
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [localSearch, debouncedSearch]);

  // Clear all search params from URL on fresh mount/refresh
  useEffect(() => {
    if (searchParams.has('search') || searchParams.has('difficulty') || searchParams.has('tag')) {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      params.delete('difficulty');
      params.delete('tag');
      setSearchParams(params, { replace: true });
    }
  }, []);

  // Fetch problems when URL parameters change
  useEffect(() => {
    dispatch(fetchProblems({ page, search: debouncedSearch, difficulty, tag, limit: 20 }));
  }, [dispatch, page, debouncedSearch, difficulty, tag]);

  return (
    <div className="auth-page-bg" data-auth-theme={theme} style={{ minHeight: 'calc(100vh - 64px)', padding: '1rem 0', display: 'block', overflowY: 'auto' }}>
      <div className="w-full">

        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'var(--auth-card)', border: '1px solid var(--auth-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <BookOpen size={20} color="var(--auth-accent)" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--auth-heading)', letterSpacing: '-0.02em' }}>
              Problem Set
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--auth-muted)', margin: 0 }}>
            Practice coding challenges and prepare for your next battle.
          </p>
        </div>

        <ProblemsFilter
          search={localSearch} setSearch={setLocalSearch}
          difficulty={difficulty} setDifficulty={setDifficulty}
          tag={tag} setTag={setTag}
          allTags={PROBLEM_TOPICS}
        />

        <ProblemsTable problems={problems} loading={loading} error={error} page={page} />

        {!loading && !error && (
          <Pagination pagination={pagination} setPage={setPage} label="problems" />
        )}

      </div>
    </div>
  );
};

export default ProblemsPage;
