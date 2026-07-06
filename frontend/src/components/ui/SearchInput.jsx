import { Search, X } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = "Search...", style = {} }) => {
  return (
    <div style={{ position: 'relative', flex: 1, ...style }}>
      <div
        style={{
          position: 'absolute', left: '1rem', top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }}
      >
        <Search size={16} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full"
        style={{ paddingLeft: '2.5rem', paddingRight: value ? '2.5rem' : '1rem' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '0.75rem', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', background: 'none',
            border: 'none', cursor: 'pointer', display: 'flex',
            padding: 0,
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
