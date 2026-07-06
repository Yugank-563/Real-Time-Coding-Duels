const ActivityHeatmap = ({ data, stats }) => {
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-overlay)] shadow-sm rounded-3xl p-6 lg:p-8">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
               <h3 className="text-xl font-medium text-[var(--text-primary)] m-0">
                  <span className="text-[1.35rem] font-semibold text-[var(--text-primary)] tracking-tight">0</span> submissions in the last one year
               </h3>
            </div>
         </div>
         
         {/* Empty State Heatmap Area */}
         <div className="w-full h-[88px] border border-dashed border-[var(--bg-overlay)] rounded-xl flex items-center justify-center bg-[var(--bg-base)]/50">
            <span className="text-[0.85rem] text-[var(--text-muted)] font-medium">Activity history not yet available.</span>
         </div>
      </div>
    );
  }

  const totalSubmissions = stats?.totalSubmissions ?? data.reduce((sum, item) => sum + item.count, 0);
  const activeDays = stats?.activeDays ?? data.filter(item => item.count > 0).length;
  const maxStreak = stats?.maxStreak ?? 0;

  // Group days by month dynamically
  const dynamicMonths = [];
  let currentMonth = null;
  
  data.forEach((dayData) => {
    // Use strictly UTC to avoid timezone shifts jumping dates
    const d = new Date(dayData.date);
    const monthName = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    
    if (!currentMonth || currentMonth.name !== monthName) {
      currentMonth = { name: monthName, days: [] };
      dynamicMonths.push(currentMonth);
    }
    currentMonth.days.push(dayData);
  });

  return (
    <div className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-overlay)] shadow-sm rounded-3xl p-6 lg:p-8">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
             <h3 className="text-xl font-medium text-[var(--text-primary)] m-0 flex items-center gap-1.5">
                <span className="text-[1.35rem] font-semibold text-[var(--text-primary)] tracking-tight">{totalSubmissions}</span> 
                <span className="text-[1.1rem]">submissions in the last one year</span>
             </h3>
          </div>
          
          <div className="flex items-center gap-5 text-[0.85rem] text-[var(--text-muted)]">
             <span>Total active days: <span className="font-semibold text-[var(--text-primary)]">{activeDays}</span></span>
             <span>Max streak: <span className="font-semibold text-[var(--text-primary)]">{maxStreak}</span></span>
          </div>
       </div>
       
       {/* Heatmap Area */}
       <div className="w-full overflow-x-auto pb-4">
          <div className="w-full flex items-end justify-between min-w-[850px] px-1">
             {dynamicMonths.map((month, mIndex) => (
                <div key={mIndex} className="flex flex-col items-center gap-2">
                   <div className="flex flex-col flex-wrap gap-[3px] h-[88px] content-start">
                      {month.days.map((dayData, i) => {
                         const count = dayData.count;
                         let opacity = 1;
                         if (count >= 5) opacity = 1;
                         else if (count >= 3) opacity = 0.8;
                         else if (count >= 2) opacity = 0.6;
                         else if (count >= 1) opacity = 0.4;
                         
                         return (
                            <div 
                               key={i} 
                               title={`${dayData.date.split('T')[0]}: ${count} submissions`}
                               className="w-[10px] h-[10px] rounded-[2px] transition-all duration-300"
                               style={{
                                  backgroundColor: count > 0 ? 'var(--btn-primary-bg)' : 'var(--border)',
                                  opacity: count > 0 ? opacity : 0.6
                               }}
                            />
                         );
                      })}
                   </div>
                   <span className="text-[0.75rem] text-[var(--text-muted)] font-medium">{month.name}</span>
                </div>
             ))}
          </div>
       </div>
       
    </div>
  );
};

export default ActivityHeatmap;
