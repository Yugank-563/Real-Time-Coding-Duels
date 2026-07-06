const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[var(--text-muted)] opacity-20 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
