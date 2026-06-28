export const InvitationLoading = ({ isDark }) => (
  <div className="flex justify-center items-center py-20">
    <div className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin ${
      isDark ? 'border-[#00F5C4]' : 'border-[#4F6EF7]'
    }`} />
  </div>
);

export const InvitationBadge = ({ count, isDark }) => {
  if (!count || count === 0) return null;
  
  return (
    <span className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse-slow shadow-sm ${
      isDark ? 'bg-[#00F5C4] text-[#0D0F14]' : 'bg-[#4F6EF7] text-white'
    }`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};
