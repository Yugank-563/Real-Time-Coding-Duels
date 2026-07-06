import { Link } from 'react-router-dom';
import { Button } from '../index';

const InvitationCard = ({ 
  invitation: inv, 

  onAccept, 
  onDecline 
}) => {

  const baseStyles = "flex flex-row items-center justify-between p-4 md:p-5 gap-3 rounded-2xl border transition-all bg-[#161A24] border-[rgba(255,255,255,0.05)] hover:border-[#00F5C4]/30";

  return (
    <div className={baseStyles}>
      <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${inv.sender?.username}`}
            className="text-lg font-bold truncate hover:underline hover:text-[#00F5C4] transition-colors"
          >
            @{inv.sender?.username}
          </Link>
          <div className="text-sm text-slate-400 truncate mt-1 flex flex-col gap-0.5">
            <span>
              Invited you to a <b className="text-slate-200">{inv.battleMode === 'timed-sprint' ? 'Timed Sprint' : inv.battleMode === 'topic-duel' ? 'Topic Duel' : 'Random Duel'}</b>
            </span>

            {inv.battleMode === 'topic-duel' && inv.metadata?.topic && (
              <span className="text-xs text-accent-primary font-bold tracking-wide">
                Topic: {inv.metadata.topic}
              </span>
            )}
            {inv.metadata?.difficulty && (
              <span className="text-xs text-amber-500 font-medium tracking-wide">
                Difficulty: {inv.metadata.difficulty}
              </span>
            )}
          </div>
          <div className="text-[10px] mt-1 opacity-60">
            {new Date(inv.createdAt).toLocaleString()}
          </div>
      </div>

      <div className="flex flex-col sm:flex-row shrink-0 gap-2">
        <Button 
          variant="primary"
          onClick={(e) => { e.preventDefault(); onAccept(inv._id); }}
          className="flex-1 sm:flex-none !px-4 !py-2 !text-xs !shadow-lg"
        >
          ACCEPT
        </Button>
        <Button 
          variant="outline"
          onClick={(e) => { e.preventDefault(); onDecline(inv._id); }}
          className="flex-1 sm:flex-none !px-4 !py-2 !text-xs !border-red-500/50 !text-red-500 hover:!bg-red-50"
        >
          DECLINE
        </Button>
      </div>
    </div>
  );
};

export default InvitationCard;
