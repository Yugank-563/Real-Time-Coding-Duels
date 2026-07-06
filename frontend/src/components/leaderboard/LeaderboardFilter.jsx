import { Globe } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';
import SearchInput from '../ui/SearchInput';

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
        <Globe size={16} color="var(--text-muted)" />
        <CustomDropdown
          value={country || 'ALL'}
          onChange={setCountry}
          options={countryOptions}
        />
      </div>
    </div>
  );
};

export default LeaderboardFilter;
