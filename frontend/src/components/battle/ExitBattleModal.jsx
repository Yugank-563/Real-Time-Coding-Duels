import Modal from '../ui/Modal';
import Button from '../ui/Button';

const ExitBattleModal = ({ show, onCancel, onConfirm, isCasual }) => {
  return (
    <Modal isOpen={show} onClose={onCancel} hideClose noPadding className="!border-[var(--accent-red)]/30 !shadow-[0_0_50px_rgba(239,68,68,0.18)]">
        <div className="p-6 pb-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/25 text-red-400 animate-pulse text-lg">
            ⚠️
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Exit Battle?</h3>
            <p className="text-[10px] text-red-400 font-semibold tracking-wider uppercase mt-0.5">Danger Zone</p>
          </div>
        </div>

        <div className="p-6 space-y-3.5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to exit the battle? Doing so will count as an immediate <span className="text-red-400 font-bold">Loss</span>
            {!isCasual && (
              <> and <span className="text-red-400 font-semibold underline">deduct rating points</span> from your score</>
            )}.
          </p>
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-red-400 text-xs mt-0.5">⚡</span>
            <p className="text-[11px] text-red-300/80 leading-snug">
              This action is irreversible. Your opponent will automatically be awarded the win.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--bg-overlay)] border-t border-[var(--border)] flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
          >
            {isCasual ? 'Exit Battle' : 'Exit and Lose Score'}
          </Button>
        </div>
    </Modal>
  );
};

export default ExitBattleModal;
