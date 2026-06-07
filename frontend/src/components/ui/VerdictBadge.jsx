
export const VerdictBadge = ({ verdict }) => {
  const getBadgeData = (verd) => {
    switch (verd) {
      case 'AC': return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Accepted', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' };
      case 'WA': return { icon: <XCircle className="w-3.5 h-3.5" />, text: 'Wrong Answer', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      case 'TLE': return { icon: <Clock className="w-3.5 h-3.5" />, text: 'Time Limit', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
      case 'MLE': return { icon: <Database className="w-3.5 h-3.5" />, text: 'Memory Limit', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
      case 'CE': return { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Compile Error', color: 'text-[#7A9AB8] border-[#1E2D40] bg-[#0D1520]' };
      case 'RE': return { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Runtime Error', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      default: return { icon: null, text: 'No Submission', color: 'text-[#7A9AB8] border-[#1E2D40] bg-[#0D1520]' };
    }
  };

  const { icon, text, color } = getBadgeData(verdict);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold uppercase tracking-wider ${color}`}>
      {icon} {text}
    </span>
  );
};

export default VerdictBadge;
