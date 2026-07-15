import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Calendar, User as UserIcon } from 'lucide-react';
import { Button, AnimationState } from '../components/index';
import { useProfile } from '../hooks/useProfile';
import { useDocumentTitle } from '../hooks/index';
import { getTierColors } from '../utils/index';

import EditProfileModal from '../components/profile/EditProfileModal';
import ActivityHeatmap from '../components/profile/ActivityHeatmap';
import RecentBattles from '../components/profile/RecentBattles';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';

const ProfilePage = () => {
  const { username } = useParams();
  useDocumentTitle(`${username}'s Profile`);
  const { profile, loading, isOwn, handleSave } = useProfile(username);
  const [editOpen, setEditOpen] = useState(false);


  if (loading) return (
    <ProfileSkeleton />
  );

  if (!profile) return (
    <div className="page-bg flex items-center justify-center min-h-[70vh]">
      <AnimationState 
        variant="404" 
        title="User Not Found" 
        description={`@${username} doesn't exist on Coduelo.`} 
      />
    </div>
  );

  const { user, battleStats, activityStats } = profile;


  return (
    <div className="w-full flex flex-col">
        {/* ── HEADER NAVIGATION / BREADCRUMB AREA ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="icon-box">
              <UserIcon size={20} color="var(--accent-primary)" />
            </div>
            <h1 className="text-[1.75rem] font-extrabold m-0 text-[var(--text-primary)] tracking-[-0.02em]">
              {isOwn ? 'Your Profile' : `${user.name || user.username}'s Profile`}
            </h1>
          </div>
          <p className="text-[0.9rem] text-[var(--text-muted)] m-0">
            View competitive statistics, match history, and problem-solving progress.
          </p>
        </div>

        <div className="w-full flex flex-col gap-6 pb-12">
        
        {/* ── SECTION 1 & 2: PROFILE AND RATING CARDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* PROFILE IDENTITY CARD */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent pointer-events-none -z-0" />
            
            <div className="flex flex-col items-center relative z-10 w-full">

               
               <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 justify-center leading-none mb-1">
                    <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
                      {user.name || user.username}
                    </h1>
                  </div>
                  <span className="text-[0.95rem] text-[var(--text-muted)] font-medium">
                    @{user.username}
                  </span>
                  
                  <div className="flex items-center justify-center gap-3 mt-3">
                     {user.country && (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-overlay)]/30 text-[var(--text-muted)]">
                          <Globe size={13} />
                          <span className="text-[0.75rem] font-medium">{user.country}</span>
                        </div>
                     )}
                     <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-overlay)]/30 text-[var(--text-muted)]">
                        <Calendar size={13} />
                        <span className="text-[0.75rem] font-medium">Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                     </div>
                  </div>
               </div>
               
               <div className="w-full mt-4 pt-4 border-t border-[var(--bg-overlay)] flex flex-col gap-3 text-left">
                 {user.bio ? (
                   <p className="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed m-0 whitespace-pre-wrap">
                     {user.bio}
                   </p>
                 ) : (
                   <p className="text-[0.9rem] text-[var(--text-muted)] italic m-0">This user hasn't added a biography yet.</p>
                 )}
               </div>

               {isOwn && (
                 <div className="w-full mt-4 pt-4 border-t border-[var(--bg-overlay)] flex justify-center">
                   <Button variant="outline" onClick={() => setEditOpen(true)} className="w-1/2 min-w-[150px] text-[0.85rem] py-2.5">
                     Edit Profile
                   </Button>
                 </div>
               )}
            </div>
          </div>

          {/* BATTLE RATING PERFORMANCE CARD */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-center">
              
              <div className="relative z-10 mb-4 pb-3 border-b border-[var(--bg-overlay)] flex flex-col items-start text-left">
                <h3 className="text-[1.25rem] font-bold m-0 text-[var(--text-primary)] tracking-tight">
                  Battle Rating
                </h3>
                <p className="text-[0.85rem] text-[var(--text-muted)] m-0 mt-1 font-medium">Overall competitive performance.</p>
              </div>
              
              <div className="grid grid-cols-2 relative z-10 w-full h-full">
                {/* Rating */}
                <div className="py-5 px-4 flex flex-col items-center justify-center border-b border-r border-[var(--bg-overlay)]">
                  <span 
                    className="text-4xl font-black leading-none mb-1.5 tracking-tighter"
                    style={{ color: getTierColors(user.rating || 1200).color }}
                  >
                    {user.rating || 1200}
                  </span>
                  <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">Rating</span>
                </div>
                
                {/* Global Rank */}
                <div className="py-5 px-4 flex flex-col items-center justify-center border-b border-[var(--bg-overlay)]">
                  <span className="text-4xl font-extrabold text-[var(--text-primary)] leading-none mb-1.5 tracking-tight">
                    {user.globalRank ? `#${user.globalRank}` : '—'}
                  </span>
                  <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">Rank</span>
                </div>

                {/* Battles */}
                <div className="py-5 px-4 flex flex-col items-center justify-center border-r border-[var(--bg-overlay)]">
                  <span className="text-4xl font-bold text-[var(--text-primary)] leading-none mb-1.5 tracking-tight">
                    {battleStats.totalBattles || 0}
                  </span>
                  <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">Battles</span>
                </div>

                {/* Win Rate */}
                <div className="py-5 px-4 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#10B981] leading-none mb-1.5 tracking-tight">
                    {battleStats.winRate || 0}%
                  </span>
                  <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">Win Rate</span>
                </div>
              </div>
          </div>
        </div>

        {/* ── SECTION 3: ACTIVITY HEATMAP ── */}
        <ActivityHeatmap data={profile.activityMap} stats={profile.activityStats} />

        {/* ── SECTION 5: RECENT BATTLES PLACEHOLDER ── */}
        <RecentBattles data={profile.recentBattles} />

      </div>

      {/* Modal */}
      {isOwn && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          initialData={user}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProfilePage;
