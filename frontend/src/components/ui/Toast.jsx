import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { removeToast, selectToasts } from '../../features/index';

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  battle: '⚔️',
};

const TOAST_COLORS = {
  success: 'border-emerald/40 bg-emerald/5',
  error: 'border-danger/40 bg-danger/5',
  warning: 'border-warning/40 bg-warning/5',
  info: 'border-blue/40 bg-blue/5',
  battle: 'border-primary/40 bg-primary/5',
};

const Toast = ({ toast }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex items-center gap-3 w-80 p-4 rounded-xl border bg-surface shadow-card-hover backdrop-blur-sm ${TOAST_COLORS[toast.type]}`}
      role="alert"
    >
      <span className="text-lg shrink-0">{TOAST_ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0 leading-snug">
        <span className="text-sm font-semibold text-text-primary">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const toasts = useSelector(selectToasts);

  return (
    <div
      className="fixed bottom-10 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};