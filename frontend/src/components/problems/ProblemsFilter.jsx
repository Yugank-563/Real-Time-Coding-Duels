import { useState } from 'react';
import '../../styles/auth.css';
import { CustomDropdown, SearchInput } from '../index';
import { Filter, X } from 'lucide-react';

const ProblemsFilter = ({ search, setSearch, difficulty, setDifficulty, tag, setTag, allTags }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative" style={{ maxWidth: '100%', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', zIndex: 10 }}>
      
      {/* Search Input */}
      <div style={{ flex: '1 1 200px', position: 'relative', display: 'flex', gap: '0.5rem' }}>
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Search problems..." 
        />
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="md:hidden flex items-center justify-center bg-[var(--auth-card-border)] hover:bg-[var(--auth-hover)] rounded-md px-3 transition-colors"
        >
          <Filter size={18} color="var(--auth-heading)" />
        </button>
      </div>

      {/* Filter Options (Desktop & Drawer Mobile) */}
      <div className={`
        fixed inset-0 z-[100] md:static md:z-auto
        md:flex md:flex-row md:items-center md:gap-1 md:flex-wrap
        ${isDrawerOpen ? 'flex flex-col' : 'hidden md:flex'}
      `}>
        {/* Mobile Backdrop */}
        {isDrawerOpen && (
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm md:hidden" 
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Drawer Content */}
        <div className={`
          relative md:static w-[80%] md:w-auto h-full md:h-auto 
          bg-[var(--auth-card)] md:bg-transparent border-r border-[var(--auth-card-border)] md:border-none
          p-6 md:p-0 flex flex-col md:flex-row gap-4 md:gap-2
          transform transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Drawer Header (Mobile Only) */}
          <div className="flex md:hidden items-center justify-between mb-4 border-b border-[var(--auth-card-border)] pb-4">
            <h3 className="text-lg font-bold text-[var(--auth-heading)]">Filters</h3>
            <button onClick={() => setIsDrawerOpen(false)}>
              <X size={20} color="var(--auth-muted)" />
            </button>
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px' }}>
            <Filter size={16} color="var(--auth-muted)" className="hidden md:block" />
            <CustomDropdown
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { label: 'All Difficulties', value: 'ALL' },
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' }
              ]}
              buttonClassName="auth-input flex items-center justify-between"
              menuClassName="auth-dropdown-menu absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-60"
              optionClassName="auth-dropdown-option w-full text-left px-4 py-2.5 text-xs block truncate"
            />
          </div>

          {/* Tag Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <CustomDropdown
              value={tag}
              onChange={setTag}
              options={[
                { label: 'All Tags', value: 'ALL' },
                ...allTags.map(t => ({ label: t, value: t }))
              ]}
              buttonClassName="auth-input flex items-center justify-between"
              menuClassName="auth-dropdown-menu absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-60"
              optionClassName="auth-dropdown-option w-full text-left px-4 py-2.5 text-xs block truncate"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsFilter;
