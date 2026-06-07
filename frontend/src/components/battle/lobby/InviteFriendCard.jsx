import { Users, Search } from 'lucide-react';

const InviteFriendCard = ({ searchTerm, setSearchTerm, handleSendInvite }) => {
  return (
    <div className="bg-surface border border-border/80 shadow-md rounded-2xl p-6 sm:p-8 space-y-5 flex flex-col justify-start">
      <div className="space-y-4">
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-accent-primary flex items-center gap-2">
          <Users className="w-4 h-4" /> Invite a Friend
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">Search for active developers and challenge them to a live custom code duel.</p>

        <div className="relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search usernames... (e.g. yugank)"
            className="w-full bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-text-muted pl-10 text-text-primary"
          />
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleSendInvite(searchTerm)}
        className="w-full py-3.5 mt-4 rounded-xl bg-elevated hover:bg-overlay border border-border hover:border-accent-primary text-text-primary text-xs font-bold transition-all duration-200 active:scale-[0.98] uppercase tracking-wider"
      >
        Send Battle Invitation
      </button>
    </div>
  );
};

export default InviteFriendCard;
