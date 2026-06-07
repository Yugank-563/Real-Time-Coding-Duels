import React, { useState, useEffect, useRef } from 'react';
import ResizeHandle from './ResizeHandle';


const ResizableLayout = ({ children }) => {
  const [leftWidth, setLeftWidth] = useState(50); // percentage (50-50 at start)
  const [lastWidth, setLastWidth] = useState(50); // remember last expanded size
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const [leftComponent, rightComponent] = React.Children.toArray(children);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      // restore
      setLeftWidth(lastWidth);
      setIsCollapsed(false);
    } else {
      // collapse
      setLastWidth(leftWidth);
      setLeftWidth(0);
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || isCollapsed || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidthPx = e.clientX - containerRect.left;
      const newWidthPct = (newWidthPx / containerRect.width) * 100;

      // Restrict left panel smoothly to be strictly between 35% and 65%
      const clampedPct = Math.max(35, Math.min(65, newWidthPct));
      setLeftWidth(clampedPct);
      setLastWidth(clampedPct);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isCollapsed]);

  // Touch support for mobile resize dragging
  const handleTouchStart = (e) => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isResizing || isCollapsed || !containerRef.current || !e.touches[0]) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX;
      const newWidthPx = touchX - containerRect.left;
      const newWidthPct = (newWidthPx / containerRect.width) * 100;

      // Restrict left panel smoothly to be strictly between 35% and 65%
      const clampedPct = Math.max(35, Math.min(65, newWidthPct));
      setLeftWidth(clampedPct);
      setLastWidth(clampedPct);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing, isCollapsed]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-visible lg:overflow-hidden relative select-none"
    >
      {/* ── LEFT PANEL (PROBLEM DESCRIPTION) ── */}
      <div
        className={`h-auto lg:min-h-0 lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-border ${isResizing ? '' : 'transition-all duration-300'} w-full lg:w-[var(--left-width)]`}
        style={{
          '--left-width': isCollapsed ? '0%' : `${leftWidth}%`,
          opacity: isCollapsed ? 0 : 1,
          display: isCollapsed ? 'none' : 'flex'
        }}
      >
        {leftComponent}
      </div>

      {/* ── DRAGGABLE CENTER SPLITTER ── */}
      <div className="hidden lg:block h-full">
        <ResizeHandle
          onMouseDown={handleMouseDown}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* ── RIGHT PANEL (MONACO EDITOR & RESULTS) ── */}
      <div
        className={`flex-1 h-auto lg:min-h-0 lg:h-full flex flex-col ${isResizing ? '' : 'transition-all duration-300'} w-full lg:w-[calc(100%-var(--left-width))]`}
        style={{
          '--left-width': isCollapsed ? '0%' : `${leftWidth}%`
        }}
      >
        {rightComponent}
      </div>

      {/* ── ANTI-LAG RESIZE MOUSE CAPTURE OVERLAY ── */}
      {isResizing && (
        <div
          className="absolute inset-0 bg-transparent select-none cursor-col-resize pointer-events-auto z-[9999]"
          style={{ userSelect: 'none' }}
        />
      )}
    </div>
  );
};

export default ResizableLayout;
