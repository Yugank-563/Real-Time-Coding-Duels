const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg', 'full'
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  title = '',
  loadingText = 'Processing...',
  ...props
}) => {
  let baseClass = 'font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden active:scale-[0.98] ';

  if (variant === 'primary') {
    // using the existing index.css `.btn-primary` logic or standardizing it here if needed
    // since index.css has .btn-primary, we can just use it or build upon it.
    baseClass += 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-glow-primary hover:brightness-110 ';
  } else if (variant === 'danger') {
    baseClass += 'bg-[var(--accent-red)] text-white hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.3)] ';
  } else if (variant === 'secondary') {
    baseClass += 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-overlay)] ';
  } else if (variant === 'ghost') {
    baseClass += 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]/50 ';
  } else if (variant === 'outline') {
    baseClass += 'bg-transparent border border-[var(--border)] text-[var(--btn-primary-bg)] hover:border-[var(--btn-primary-bg)] hover:text-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-bg)]/10 hover:shadow-glow-primary ';
  } else if (variant === 'success') {
    baseClass += 'bg-[var(--accent-emerald)] text-[var(--bg-base)] hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.3)] ';
  } else if (variant === 'link') {
    baseClass += 'bg-transparent text-[var(--accent-primary)] hover:underline !p-0 !h-auto font-bold uppercase tracking-wider ';
  }

  // Size logic
  if (size === 'sm') baseClass += 'px-3 py-1.5 text-[10px] rounded-lg ';
  else if (size === 'md') baseClass += 'h-9 px-4 text-[11px] rounded-xl ';
  else if (size === 'lg') baseClass += 'px-6 py-3 text-xs rounded-xl ';
  else if (size === 'full') baseClass += 'w-full h-9 text-[11px] rounded-xl ';
  else if (size === 'icon') baseClass += 'w-9 h-9 rounded-xl flex items-center justify-center p-0 ';

  // Disabled logic
  if (disabled || loading) {
    baseClass += 'opacity-50 cursor-not-allowed ';
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClass} ${className}`}
      onClick={onClick}
      title={title}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
