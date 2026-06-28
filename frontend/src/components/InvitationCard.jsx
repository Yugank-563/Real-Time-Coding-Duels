import { Link } from 'react-router-dom';

const InvitationCard = ({ 
  invitation: inv, 
  variant = 'list', // 'list' | 'dropdown'
  isDark, 
  onAccept, 
  onDecline 
}) => {
  const isDropdown = variant === 'dropdown';

  const baseStyles = isDropdown
    ? `p-2 rounded-lg text-xs leading-relaxed transition-all ${
        inv.status === 'pending'
          ? isDark ? 'bg-slate-900/60 border-l-2 border-[#00F5C4]' : 'bg-slate-50 border-l-2 border-[#4F6EF7]'
          : 'opacity-70'
      }`
    : `flex flex-row items-center justify-between p-4 md:p-5 gap-3 rounded-2xl border transition-all ${
        isDark ? 'bg-[#161A24] border-[rgba(255,255,255,0.05)] hover:border-[#00F5C4]/30' 
               : 'bg-white border-slate-200 hover:border-[#4F6EF7]/30'
      }`;

  const avatarStyles = isDropdown
    ? "w-5 h-5 text-[10px]"
    : "w-12 h-12 text-lg";

  const primaryBg = isDark ? '#00F5C4' : '#4F6EF7';
  const primaryText = isDark ? '#0D0F14' : '#FFFFFF';

  return (
    <div className={baseStyles} style={{
      backdropFilter: isDropdown ? 'blur(20px)' : 'none',
    }}>
      <div className={`flex-1 min-w-0 ${isDropdown ? 'mb-2' : ''}`}>
          <Link 
            to={`/profile/${inv.sender?.username}`}
            className={`${isDropdown ? 'text-[13px]' : 'text-lg'} font-bold truncate hover:underline hover:text-[#00F5C4] transition-colors`}
          >
            @{inv.sender?.username}
          </Link>
          <div className={`${isDropdown ? 'text-[11px] text-slate-400' : `text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`} truncate`}>
            Invited you to a <b className={isDark ? 'text-slate-200' : 'text-slate-700'}>{inv.battleMode}</b> battle
          </div>
          {!isDropdown && (
            <div className="text-[10px] mt-1 opacity-60">
              {new Date(inv.createdAt).toLocaleString()}
            </div>
          )}
      </div>

      <div className={`flex ${isDropdown ? 'flex-col mt-3' : 'flex-col sm:flex-row shrink-0'} gap-2`}>
        {inv.status === 'pending' ? (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); onAccept(inv._id); }}
              className={`font-bold transition-all shadow-lg flex-1 sm:flex-none ${
                isDropdown ? 'py-1.5 rounded text-[10px]' : 'px-4 py-2 rounded-lg text-xs'
              } ${
                isDark 
                  ? 'bg-[#00F5C4] text-[#0D0F14] hover:shadow-[0_0_10px_rgba(0,245,196,0.3)]' 
                  : 'bg-[#4F6EF7] text-white hover:shadow-[0_0_10px_rgba(79,110,247,0.3)]'
              }`}
            >
              ACCEPT
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onDecline(inv._id); }}
              className={`font-bold border transition-colors flex-1 sm:flex-none ${
                isDropdown ? 'py-1.5 rounded text-[10px]' : 'px-4 py-2 rounded-lg text-xs'
              } ${
                isDark 
                  ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                  : 'border-red-500/50 text-red-500 hover:bg-red-50'
              }`}
            >
              DECLINE
            </button>
          </>
        ) : (
          <div className={`font-bold uppercase tracking-wider ${
            isDropdown ? 'text-[10px] font-jetbrains' : 'px-4 py-1.5 rounded-full text-xs'
          } ${
            inv.status === 'accepted' 
              ? (isDark ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50') 
              : inv.status === 'declined' 
                ? (isDark ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50') 
                : (isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100')
          }`}
          style={isDropdown ? { backgroundColor: 'transparent', padding: 0 } : {}}
          >
            {inv.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
