import { CheckCircle2, XCircle, Clock, Database, AlertCircle, HelpCircle } from 'lucide-react';

const VerdictBadge = ({ verdict }) => {
  const getBadgeData = (verd) => {
    switch (verd) {
      case 'AC': return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Accepted', color: 'text-[#2DB55D] border-[#2DB55D]/20 bg-[#2DB55D]/10' };
      case 'WA': return { icon: <XCircle className="w-3.5 h-3.5" />, text: 'Wrong Answer', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      case 'TLE': return { icon: <Clock className="w-3.5 h-3.5" />, text: 'Time Limit Exceeded', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
      case 'MLE': return { icon: <Database className="w-3.5 h-3.5" />, text: 'Memory Limit Exceeded', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
      case 'CE': return { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Compilation Error', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      case 'RE': return { icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Runtime Error', color: 'text-red-400 border-red-500/20 bg-red-500/10' };
      default: return { icon: <HelpCircle className="w-3.5 h-3.5" />, text: 'No Submission', color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' };
    }
  };

  const { icon, text, color } = getBadgeData(verdict);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold capitalize tracking-wider ${color}`}>
      {icon} {text}
    </span>
  );
};

export default VerdictBadge;
