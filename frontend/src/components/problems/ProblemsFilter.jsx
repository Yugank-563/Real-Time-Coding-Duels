import { useState } from 'react';
import CustomDropdown from '../ui/CustomDropdown';
import SearchInput from '../ui/SearchInput';
import { Filter, X } from 'lucide-react';

const ProblemsFilter = ({ search, setSearch, difficulty, setDifficulty, tag, setTag, allTags }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative w-full max-w-full mb-4 flex gap-4 flex-wrap items-center z-10">
      
      {/* Search Input */}
      <div className="flex-1 basis-[200px] relative flex gap-2">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Search problems..." 
        />
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="md:hidden flex items-center justify-center bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)] rounded-md px-3 transition-colors"
        >
          <Filter size={18} color="var(--text-primary)" />
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
          bg-[var(--bg-surface)] md:bg-transparent border-r border-[var(--bg-overlay)] md:border-none
          p-6 md:p-0 flex flex-col md:flex-row gap-4 md:gap-2
          transform transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Drawer Header (Mobile Only) */}
          <div className="flex md:hidden items-center justify-between mb-4 border-b border-[var(--bg-overlay)] pb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Filters</h3>
            <button onClick={() => setIsDrawerOpen(false)}>
              <X size={20} color="var(--text-muted)" />
            </button>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 min-w-[160px]">
            <Filter size={16} color="var(--text-muted)" className="hidden md:block" />
            <CustomDropdown
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { label: 'All Difficulties', value: 'ALL' },
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' }
              ]}
            />
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <CustomDropdown
              value={tag}
              onChange={setTag}
              options={[
                { label: 'All Tags', value: 'ALL' },
                ...allTags.map(t => ({ label: t, value: t }))
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemsFilter;
