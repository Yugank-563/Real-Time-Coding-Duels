import Skeleton from '../ui/Skeleton';

const ProfileSkeleton = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full">
        {/* ── HEADER NAVIGATION / BREADCRUMB AREA ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Skeleton className="w-5 h-5 rounded-md" />
            <Skeleton className="w-48 h-8 rounded-lg" />
          </div>
          <Skeleton className="w-64 h-4 rounded-md mt-2" />
        </div>

        <div className="w-full flex flex-col gap-6 pb-12">
          
          {/* ── SECTION 1 & 2: PROFILE AND RATING CARDS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PROFILE IDENTITY CARD SKELETON */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
              <div className="flex flex-col items-center relative z-10 w-full mt-2">
                <Skeleton className="w-40 h-9 rounded-lg mb-1" />
                <Skeleton className="w-24 h-5 rounded-md mt-1" />
                
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-28 h-6 rounded-full" />
                </div>
                
                <div className="w-full mt-4 pt-4 border-t border-[var(--bg-overlay)] flex flex-col gap-3 items-center text-left">
                  <Skeleton className="w-11/12 h-4 rounded-md" />
                  <Skeleton className="w-full h-4 rounded-md" />
                  <Skeleton className="w-4/5 h-4 rounded-md" />
                </div>

                <div className="w-full mt-4 pt-4 border-t border-[var(--bg-overlay)] flex justify-center">
                  <Skeleton className="w-1/2 min-w-[150px] h-10 rounded-xl" />
                </div>
              </div>
            </div>

            {/* BATTLE RATING PERFORMANCE CARD SKELETON */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center">
              <div className="relative z-10 mb-4 pb-3 border-b border-[var(--bg-overlay)] flex flex-col items-start text-left">
                <Skeleton className="w-36 h-7 rounded-lg" />
                <Skeleton className="w-56 h-4 rounded-md mt-2" />
              </div>
              
              <div className="grid grid-cols-2 relative z-10 w-full h-full mt-2">
                <div className="py-5 px-4 flex flex-col items-center justify-center border-b border-r border-[var(--bg-overlay)]">
                  <Skeleton className="w-24 h-10 rounded-lg mb-2" />
                  <Skeleton className="w-16 h-3 rounded-md" />
                </div>
                
                <div className="py-5 px-4 flex flex-col items-center justify-center border-b border-[var(--bg-overlay)]">
                  <Skeleton className="w-16 h-10 rounded-lg mb-2" />
                  <Skeleton className="w-12 h-3 rounded-md" />
                </div>

                <div className="py-5 px-4 flex flex-col items-center justify-center border-r border-[var(--bg-overlay)]">
                  <Skeleton className="w-12 h-10 rounded-lg mb-2" />
                  <Skeleton className="w-16 h-3 rounded-md" />
                </div>

                <div className="py-5 px-4 flex flex-col items-center justify-center">
                  <Skeleton className="w-20 h-10 rounded-lg mb-2" />
                  <Skeleton className="w-16 h-3 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: ACTIVITY HEATMAP SKELETON ── */}
          <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-[var(--bg-overlay)] pb-4">
              <div>
                <Skeleton className="w-40 h-7 rounded-lg mb-2" />
                <Skeleton className="w-56 h-4 rounded-md" />
              </div>
              <Skeleton className="w-24 h-5 rounded-md" />
            </div>
            {/* Heatmap Grid Area placeholder */}
            <Skeleton className="w-full h-[88px] rounded-xl" />
            <div className="mt-4 flex justify-between items-center text-xs">
              <Skeleton className="w-32 h-4 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-4 rounded-md" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-3 h-3 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="w-10 h-4 rounded-md" />
              </div>
            </div>
          </div>

          {/* ── SECTION 4: RECENT BATTLES SKELETON ── */}
          <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="w-40 h-7 rounded-lg" />
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-[2fr_1fr_1fr] sm:grid-cols-3 px-4 pb-2 border-b border-[var(--bg-overlay)]">
                <Skeleton className="w-16 h-3 rounded-md" />
                <div className="flex justify-center"><Skeleton className="w-16 h-3 rounded-md" /></div>
                <div className="flex justify-end"><Skeleton className="w-16 h-3 rounded-md" /></div>
              </div>
              
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`grid grid-cols-[2fr_1fr_1fr] sm:grid-cols-3 items-center px-4 py-3 rounded-lg ${i % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="w-24 h-4 rounded-md" />
                      <Skeleton className="w-32 h-3 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Skeleton className="w-20 h-4 rounded-md" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="w-12 h-4 rounded-md" />
                    <Skeleton className="w-16 h-3 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
