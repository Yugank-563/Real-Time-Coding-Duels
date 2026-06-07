import { Globe } from 'lucide-react';
import { CustomDropdown, SearchInput } from '../index';
import '../../styles/auth.css';

/**
 * LeaderboardFilter — mirrors ProblemsFilter exactly.
 * Search (username / display name) + Country dropdown.
 */
const LeaderboardFilter = ({ search, setSearch, country, setCountry, countries = [] }) => {
  const countryOptions = [
    { label: 'All Countries', value: 'ALL' },
    ...countries.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div
      style={{
        maxWidth: '100%',
        marginBottom: '1rem',
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {/* ── Search Input ── */}
      <SearchInput 
        value={search} 
        onChange={setSearch} 
        placeholder="Search by username or name…" 
        style={{ flex: '1 1 220px' }} 
      />

      {/* ── Country Dropdown (same style as ProblemsFilter difficulty) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
        <Globe size={16} color="var(--auth-muted)" />
        <CustomDropdown
          value={country || 'ALL'}
          onChange={setCountry}
          options={countryOptions}
          buttonClassName="auth-input flex items-center justify-between"
          menuClassName="auth-dropdown-menu absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-60"
          optionClassName="auth-dropdown-option w-full text-left px-4 py-2.5 text-xs block truncate"
        />
      </div>
    </div>
  );
};

export default LeaderboardFilter;
