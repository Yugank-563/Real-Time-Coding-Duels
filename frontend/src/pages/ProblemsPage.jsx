import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from '../features/index';
import { useDocumentTitle } from '../hooks/index';
import { BookOpen } from 'lucide-react';
import { ProblemsFilter, ProblemsTable, Pagination } from '../components/index';

import { PROBLEM_TOPICS } from '../utils/index';

const ProblemsPage = () => {
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
    <div className="w-full flex flex-col">
      <div className="w-full">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="icon-box">
              <BookOpen size={20} color="var(--accent-primary)" />
            </div>
            <h1 className="text-[1.75rem] font-extrabold m-0 text-[var(--text-primary)] tracking-[-0.02em]">
              Problem Set
            </h1>
          </div>
          <p className="text-[0.9rem] text-[var(--text-muted)] m-0">
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
