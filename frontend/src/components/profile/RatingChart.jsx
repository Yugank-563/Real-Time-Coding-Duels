import {  useState, useCallback, useEffect  } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import Stat from './Stat';

const TooltipBridge = ({ active, payload, onHover }) => {
  useEffect(() => {
    onHover(active && payload?.length ? payload[0].payload : null);
  }, [active, payload, onHover]);
  return null;
};

const RatingChart = ({ data, currentRating, totalBattles, winRate }) => {
  const [hovered, setHovered] = useState(null);
  const pts = data || [];

  const handleHover = useCallback(pt => {
    if (!pt) { setHovered(null); return; }
    const i = pts.findIndex(p => p.date === pt.date);
    setHovered({ ...pt, prev: i > 0 ? pts[i - 1] : null });
  }, [pts]);

  if (!pts.length) return (
    <div style={{ padding: '1rem 0', textAlign: 'center', fontSize: '0.8rem',
                  color: 'var(--auth-muted)' }}>
      No rating history yet. Play some battles!
    </div>
  );

  const ratings  = pts.map(p => p.rating);
  const minR     = Math.min(...ratings);
  const maxR     = Math.max(...ratings);
  const peakPt   = pts.reduce((a, b) => b.rating > a.rating ? b : a, pts[0]);

  const trendArrow = (curr, prev) => {
    if (!prev) return null;
    return curr > prev.rating
      ? <span style={{ color: '#10B981', marginLeft: 3, fontWeight: 800 }}>↗</span>
      : curr < prev.rating
        ? <span style={{ color: '#EF4444', marginLeft: 3, fontWeight: 800 }}>↘</span>
        : null;
  };
  const defaultArrow = pts.length >= 2
    ? trendArrow(pts[pts.length-1].rating, pts[pts.length-2])
    : null;

  const PeakDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.date !== peakPt.date) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} style={{ fill: 'var(--auth-btn)' }} />
        <circle cx={cx} cy={cy} r={9} style={{ fill: 'var(--auth-btn)', fillOpacity: 0.22 }} />
        <rect x={cx - 28} y={cy - 26} width={56} height={18} rx={4}
              style={{ fill: 'var(--auth-btn)', fillOpacity: 0.15,
                       stroke: 'var(--auth-btn)', strokeWidth: 0.8, strokeOpacity: 0.6 }} />
        <text x={cx} y={cy - 13} textAnchor="middle"
              style={{ fill: 'var(--auth-btn)', fontSize: 10, fontWeight: 700 }}>
          {peakPt.rating}
        </text>
      </g>
    );
  };

  const ActiveDot = ({ cx, cy }) => (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#F59E0B" fillOpacity={0.2} />
      <circle cx={cx} cy={cy} r={4.5} fill="#F59E0B" />
      <circle cx={cx} cy={cy} r={2} fill="#fff" />
    </g>
  );

  const EndDot = ({ cx, cy, index }) =>
    index === pts.length - 1 && pts.length > 0
      ? <circle cx={cx} cy={cy} r={3} fill="#fff" />
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem', paddingBottom: '0.65rem',
                    borderBottom: '1px solid var(--auth-card-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--auth-muted)',
                         textTransform: 'uppercase', letterSpacing: '0.07em' }}>Battle Rating</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--auth-heading)',
                         lineHeight: 1.2, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
            {(hovered ? hovered.rating : currentRating).toLocaleString()}
            {hovered ? trendArrow(hovered.rating, hovered.prev) : defaultArrow}
          </span>
        </div>
        {hovered ? (
          <>
            <Stat label="Date"   value={new Date(hovered.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
            <Stat label="Rank"   value={hovered.rank ?? '—'} />
            <Stat label="Solved" value={hovered.solved ?? '—'} />
          </>
        ) : (
          <>
            <Stat label="Rank"     value={`#${Math.max(1, Math.round((2800-currentRating)*75)).toLocaleString()}`} />
            <Stat label="Battles"  value={totalBattles} />
            <Stat label="Win Rate" value={`${winRate}%`} />
          </>
        )}
      </div>

      {/* Chart */}
      <style>{`.recharts-wrapper:focus,.recharts-surface:focus,.recharts-wrapper *:focus{outline:none!important}`}</style>
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pts} margin={{ top: 24, right: 12, left: 12, bottom: 0 }}
                      style={{ outline: 'none' }}>
            <XAxis dataKey="date" axisLine={false} tickLine={false}
                   tick={{ fill: 'var(--auth-muted)', fontSize: 10 }}
                   tickFormatter={(v, i) => (i === 0 || i === pts.length-1)
                     ? new Date(v).getFullYear() : ''}
                   interval="preserveStartEnd" />
            <YAxis domain={[minR - 60, maxR + 60]} hide />
            <Tooltip content={<TooltipBridge onHover={handleHover} />} cursor={false} />
            {hovered && (
              <ReferenceLine x={hovered.date} stroke="#F59E0B"
                             strokeWidth={1} strokeDasharray="3 3" opacity={0.45} />
            )}
            <Line type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={1.8}
                  dot={<PeakDot />} activeDot={<ActiveDot />} isAnimationActive={false} />
            <Line type="monotone" dataKey="rating" stroke="transparent" strokeWidth={0}
                  dot={<EndDot />} activeDot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingChart;
