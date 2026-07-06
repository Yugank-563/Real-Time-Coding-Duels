import { Link } from 'react-router-dom';

const RecentBattles = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-overlay)] shadow-sm rounded-3xl p-8">
         <div className="flex items-center gap-2 mb-6">
            <span className="text-[1.2rem]">⏳</span>
            <h3 className="text-xl font-extrabold m-0 text-[var(--text-primary)] tracking-tight">Recent Battles</h3>
         </div>
         <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--bg-base)] border border-[var(--bg-overlay)] rounded-xl p-4 flex items-center justify-between h-[82px] animate-pulse">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-overlay)]" />
                    <div className="flex flex-col gap-2">
                       <div className="h-4 w-32 bg-[var(--bg-overlay)] rounded" />
                       <div className="h-3 w-20 bg-[var(--bg-overlay)] rounded" />
                    </div>
                 </div>
                 <div className="h-6 w-16 bg-[var(--bg-overlay)] rounded-full" />
              </div>
            ))}
         </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-overlay)] shadow-sm rounded-3xl p-8">
         <div className="flex items-center gap-2 mb-6">
            <span className="text-[1.2rem]">⏳</span>
            <h3 className="text-xl font-extrabold m-0 text-[var(--text-primary)] tracking-tight">Recent Battles</h3>
         </div>
         <div className="w-full h-[120px] border border-dashed border-[var(--bg-overlay)] rounded-xl flex flex-col items-center justify-center bg-[var(--bg-base)]/50 gap-2 p-6 text-center">
            <span className="text-[0.95rem] text-[var(--text-primary)] font-bold">No ranked battles yet.</span>
            <span className="text-[0.8rem] text-[var(--text-muted)] font-medium">Step into the arena, write some code, and prove your skills to the world!</span>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-overlay)] shadow-sm rounded-3xl p-8">
       <div className="flex items-center gap-2 mb-6">
          <span className="text-[1.2rem]">⏳</span>
          <h3 className="text-xl font-extrabold m-0 text-[var(--text-primary)] tracking-tight">Recent Battles</h3>
       </div>
       <div className="flex flex-col gap-1">
          {/* Header Row */}
          <div className="grid grid-cols-[2fr_1fr_1fr] sm:grid-cols-3 px-4 pb-2 border-b border-[var(--bg-overlay)] text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-widest">
             <div>Battle Info</div>
             <div className="text-center">Opponent</div>
             <div className="text-right">Result</div>
          </div>
          {data.map((battle, i) => (
             <div key={battle.id} className={`grid grid-cols-[2fr_1fr_1fr] sm:grid-cols-3 items-center px-4 py-3 rounded-lg transition-colors group ${i % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-transparent'} hover:bg-[var(--bg-overlay)]/40`}>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                       <div className="text-[0.95rem] font-bold text-[var(--text-primary)] whitespace-nowrap">
                         {battle.type}
                       </div>
                       <div className="text-[0.75rem] text-[var(--text-muted)] font-medium whitespace-nowrap">
                         {new Date(battle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                         {' • '}
                         {new Date(battle.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-center">
                    <Link 
                      to={`/profile/${battle.opponent}`}
                      className="text-[0.85rem] font-bold text-[var(--text-primary)] hover:text-[var(--btn-primary-bg)] transition-colors"
                    >
                      @{battle.opponent}
                    </Link>
                 </div>

                 <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-2">
                    <div className={`font-bold text-[0.85rem] ${battle.result === 'Victory' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                       {battle.result === 'Victory' ? 'Win' : 'Loss'}
                    </div>
                    {battle.ratingChange !== undefined && (
                      <span className={`text-[0.75rem] font-bold ${battle.ratingChange > 0 ? 'text-[#10B981]' : battle.ratingChange < 0 ? 'text-[#EF4444]' : 'text-[var(--text-muted)]'}`}>
                        <span className="hidden sm:inline">(</span>{battle.ratingChange > 0 ? '+' : ''}{battle.ratingChange} ELO<span className="hidden sm:inline">)</span>
                      </span>
                    )}
                 </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default RecentBattles;
