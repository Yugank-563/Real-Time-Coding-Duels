import { Link } from 'react-router-dom';

const InvitationCard = ({ 
  invitation: inv, 
  isDark, 
  onAccept, 
  onDecline 
}) => {

  const baseStyles = `flex flex-row items-center justify-between p-4 md:p-5 gap-3 rounded-2xl border transition-all ${
    isDark ? 'bg-[#161A24] border-[rgba(255,255,255,0.05)] hover:border-[#00F5C4]/30' 
           : 'bg-white border-slate-200 hover:border-[#4F6EF7]/30'
  }`;

  return (
    <div className={baseStyles}>
      <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${inv.sender?.username}`}
            className="text-lg font-bold truncate hover:underline hover:text-[#00F5C4] transition-colors"
          >
            @{inv.sender?.username}
          </Link>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate`}>
            Invited you to a <b className={isDark ? 'text-slate-200' : 'text-slate-700'}>{inv.battleMode}</b> battle
          </div>
          <div className="text-[10px] mt-1 opacity-60">
            {new Date(inv.createdAt).toLocaleString()}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row shrink-0 gap-2">
        <button 
          onClick={(e) => { e.preventDefault(); onAccept(inv._id); }}
          className={`font-bold transition-all shadow-lg px-4 py-2 rounded-lg text-xs flex-1 sm:flex-none ${
            isDark 
              ? 'bg-[#00F5C4] text-[#0D0F14] hover:shadow-[0_0_10px_rgba(0,245,196,0.3)]' 
              : 'bg-[#4F6EF7] text-white hover:shadow-[0_0_10px_rgba(79,110,247,0.3)]'
          }`}
        >
          ACCEPT
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); onDecline(inv._id); }}
          className={`font-bold border transition-colors px-4 py-2 rounded-lg text-xs flex-1 sm:flex-none ${
            isDark 
              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
              : 'border-red-500/50 text-red-500 hover:bg-red-50'
          }`}
        >
          DECLINE
        </button>
      </div>
    </div>
  );
};

export default InvitationCard;
