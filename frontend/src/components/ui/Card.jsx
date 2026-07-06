const Card = ({ children, className = '', hover = false, as: Component = 'div', ...props }) => {
  const baseClass = 'bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl md:rounded-3xl shadow-sm transition-all duration-300 relative';
  const hoverClass = hover ? 'hover:border-[var(--accent-primary)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]' : '';

  return (
    <Component className={`${baseClass} ${hoverClass} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default Card;
