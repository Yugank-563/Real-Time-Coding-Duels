
const ResizeHandle = ({ onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      className="group relative w-1 cursor-col-resize select-none h-full flex items-center justify-center shrink-0"
      title="Drag to resize panels"
    >
      {/* Invisible broad grab zone */}
      <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize z-40 bg-transparent" />

      {/* Hairline divider */}
      <div className="w-px h-full bg-border/40 group-hover:bg-[#00f5c4]/60 group-hover:shadow-[0_0_4px_rgba(0,245,196,0.4)] transition-all duration-150 z-30" />

      {/* Small centered pill indicator */}
      <div className="absolute top-1/2 -translate-y-1/2 z-50 w-1 h-8 rounded-full bg-border/60 group-hover:bg-[#00f5c4]/80 group-hover:shadow-[0_0_6px_rgba(0,245,196,0.5)] transition-all duration-150" />
    </div>
  );
};

export default ResizeHandle;

