import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, className = '', hideClose = false, noPadding = false }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-base)]/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={hideClose ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out] ${className}`}>
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]/50">
            {title && <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">{title}</h2>}
            {!hideClose && (
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className={noPadding ? '' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
