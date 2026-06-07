
const ExitBattleModal = ({ show, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#0f111a] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.18)] max-w-md w-full mx-4 rounded-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]">
        <div className="p-6 pb-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/25 text-red-400 animate-pulse text-lg">
            ⚠️
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Exit Battle?</h3>
            <p className="text-[10px] text-red-400 font-semibold tracking-wider uppercase mt-0.5">Danger Zone</p>
          </div>
        </div>

        <div className="p-6 space-y-3.5">
          <p className="text-xs text-text-secondary leading-relaxed">
            Are you sure you want to exit the battle? Doing so will count as an immediate <span className="text-red-400 font-bold">Loss</span> and <span className="text-red-400 font-semibold underline">deduct ELO rank rating points</span> from your score.
          </p>
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-red-400 text-xs mt-0.5">⚡</span>
            <p className="text-[11px] text-red-300/80 leading-snug">
              This action is irreversible. Your opponent will automatically be awarded the win.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#0a0c14]/60 border-t border-border flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-xl border border-border bg-transparent text-text-secondary hover:text-text-primary hover:bg-overlay text-xs font-semibold transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-200"
          >
            Exit and Lose Score
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitBattleModal;
