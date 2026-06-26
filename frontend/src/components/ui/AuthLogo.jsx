
/**
 * AuthLogo — the ⚔ hexagon brand mark shown at the top of every auth card.
 * Adapts colour: #4F6EF7 (blue) in light mode, #00F5C4 (mint) in dark mode.
 */
const AuthLogo = ({ isLight }) => {
  const accent = isLight ? '#4F6EF7' : '#00F5C4';
  return (
    <div className="auth-lc-logo">
      <svg className="auth-lc-logo-icon" viewBox="0 0 50 50" fill="none">
        <polygon
          points="25,4 46,17 46,33 25,46 4,33 4,17"
          fill={accent} opacity="0.15"
        />
        <text
          x="50%" y="54%"
          dominantBaseline="middle" textAnchor="middle"
          fontSize="22" fontWeight="800"
          fill={accent} fontFamily="system-ui"
        >
          ⚔
        </text>
      </svg>
    </div>
  );
};

export default AuthLogo;
