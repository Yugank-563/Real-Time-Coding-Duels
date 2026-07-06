import { useNavigate } from 'react-router-dom';
import { getTierColors, getInitials, winRateColor, MEDAL_STYLE } from '../../utils/index';

const RankCell = ({ rank }) => {
  const medal = MEDAL_STYLE[rank];
  if (medal) {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs font-mono"
        style={{
          background: medal.bg, border: `1.5px solid ${medal.border}`,
          color: medal.color,
          boxShadow: `0 0 8px ${medal.color}33`,
        }}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="text-[var(--text-muted)] text-[0.85rem] font-mono font-bold w-8 inline-block text-center">
      {rank}
    </span>
  );
};

const LeaderboardTableRow = ({ user, i, isPinned = false, myUserId }) => {
  const navigate = useNavigate();
  const isMe     = user._id?.toString() === myUserId?.toString();
  const tier     = getTierColors(user.rating);
  const winColor = winRateColor(user.winRate);
  const isTop3   = user.globalRank <= 3;

  return (
    <tr
      onClick={() => navigate(`/profile/${user.displayName}`)}
      className={`cursor-pointer rounded-lg text-[var(--text-primary)] outline-none transition-colors duration-150 ${isPinned ? "bg-transparent" : (i % 2 !== 0 ? "bg-transparent" : "bg-[var(--bg-surface)]")}`}
    >
      <td className="p-3.5 rounded-l-lg">
        <RankCell rank={user.globalRank} />
      </td>
      
      <td className="p-3.5 max-w-[240px]">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[0.7rem] font-extrabold"
            style={{
              background: isTop3
                ? `linear-gradient(135deg, ${tier.color}, ${tier.color}88)`
                : "linear-gradient(135deg, var(--accent-primary), #00F5C4)",
              color: isTop3 ? "#fff" : "#0D0F14",
              border: isTop3 ? `1.5px solid ${tier.color}` : "none",
              boxShadow: isTop3 ? `0 0 10px ${tier.color}44` : "none",
            }}
          >
            {getInitials(user.name, user.username)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-semibold text-[0.9rem] overflow-hidden text-ellipsis whitespace-nowrap ${isMe ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                {isMe ? "You" : `@${user.displayName}`}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-3.5 text-[0.85rem] text-[var(--text-muted)]">
        {user.country || "—"}
      </td>
      <td 
        className="p-3.5 text-center font-mono font-bold text-[0.9rem]"
        style={{ color: tier.color }}
      >
        {user.rating ?? "—"}
      </td>
      <td className="hidden sm:table-cell p-3.5 text-center text-sm text-[var(--text-primary)]">
        {user.battlesPlayed ?? 0}
      </td>
      <td className="hidden sm:table-cell p-3.5 text-center rounded-r-lg">
        <div className="inline-flex flex-col items-center gap-1">
          <span 
            className="text-sm font-bold font-mono"
            style={{ color: user.battlesPlayed > 0 ? winColor : "var(--text-muted)" }}
          >
            {user.battlesPlayed > 0 ? `${user.winRate}%` : "—"}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default LeaderboardTableRow;
