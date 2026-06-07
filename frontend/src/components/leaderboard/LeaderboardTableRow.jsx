import { useNavigate } from 'react-router-dom';
import { getTierColors, getInitials, winRateColor, MEDAL_STYLE } from '../../utils/index';
import '../../styles/auth.css';

const RankCell = ({ rank }) => {
  const medal = MEDAL_STYLE[rank];
  if (medal) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', borderRadius: '50%',
        background: medal.bg, border: `1.5px solid ${medal.border}`,
        color: medal.color, fontWeight: 800,
        fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace",
        boxShadow: `0 0 8px ${medal.color}33`,
      }}>
        {rank}
      </span>
    );
  }
  return (
    <span style={{
      color: 'var(--auth-muted)', fontSize: '0.85rem',
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      width: '32px', display: 'inline-block', textAlign: 'center',
    }}>
      {rank}
    </span>
  );
};

const LeaderboardTableRow = ({ user, i, isPinned = false, myUserId }) => {
  const navigate = useNavigate();
  const isMe     = user._id?.toString() === myUserId?.toString();
  const tier     = getTierColors(user.rank);
  const winColor = winRateColor(user.winRate);
  const isTop3   = user.globalRank <= 3;

  return (
    <tr
      onClick={() => navigate(`/profile/${user.displayName}`)}
      style={{
        cursor: "pointer",
        borderRadius: "0.5rem",
        color: "var(--auth-heading)",
        background: isPinned 
          ? "transparent" 
          : (i % 2 !== 0 ? "transparent" : "var(--auth-card)"),
        outline: "none",
        transition: "background 0.15s",
      }}
      className="hover:bg-[var(--auth-input-bg)]"
    >
      <td style={{ padding: "0.9rem 0.9rem", borderRadius: "0.5rem 0 0 0.5rem" }}>
        <RankCell rank={user.globalRank} />
      </td>
      
      <td style={{ padding: "0.9rem 0.9rem", maxWidth: "240px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: isTop3
              ? `linear-gradient(135deg, ${tier.color}, ${tier.color}88)`
              : "linear-gradient(135deg, var(--auth-accent), #00F5C4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800,
            color: isTop3 ? "#fff" : "#0D0F14",
            border: isTop3 ? `1.5px solid ${tier.color}` : "none",
            boxShadow: isTop3 ? `0 0 10px ${tier.color}44` : "none",
          }}>
            {getInitials(user.displayName)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center",
              gap: "0.4rem", flexWrap: "wrap",
            }}>
              <span style={{
                fontWeight: 600, fontSize: "0.9rem",
                color: isMe ? "var(--auth-accent)" : "var(--auth-heading)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {isMe ? "You" : `@${user.displayName}`}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td
        className="hidden md:table-cell"
        style={{
          padding: "0.9rem 0.9rem",
          fontSize: "0.85rem", color: "var(--auth-muted)",
        }}
      >
        {user.country || "—"}
      </td>
      <td style={{
        padding: "0.9rem 0.9rem", textAlign: "center",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700, fontSize: "0.9rem",
        color: tier.color,
      }}>
        {user.rank ?? "—"}
      </td>
      <td
        className="hidden sm:table-cell"
        style={{
          padding: "0.9rem 0.9rem", textAlign: "center",
          fontSize: "0.875rem", color: "var(--auth-heading)",
        }}
      >
        {user.battlesPlayed ?? 0}
      </td>
      <td
        className="hidden sm:table-cell"
        style={{ padding: "0.9rem 0.9rem", textAlign: "center", borderRadius: "0 0.5rem 0.5rem 0" }}
      >
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
          <span style={{
            fontSize: "0.875rem", fontWeight: 700,
            color: user.battlesPlayed > 0 ? winColor : "var(--auth-muted)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {user.battlesPlayed > 0 ? `${user.winRate}%` : "—"}
          </span>
        </div>
      </td>
    </tr>
  );
};

export default LeaderboardTableRow;
