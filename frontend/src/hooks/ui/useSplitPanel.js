import { useState, useEffect, useRef, useCallback } from 'react';

export const useSplitPanel = (persistKey = 'bc-split-width') => {
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem(persistKey);
    return saved ? Number(saved) : 50; // 50/50 default split
  });
  const [lastWidth, setLastWidth] = useState(leftWidth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      setLeftWidth(lastWidth);
      setIsCollapsed(false);
    } else {
      setLastWidth(leftWidth);
      setLeftWidth(0);
      setIsCollapsed(true);
    }
  }, [isCollapsed, leftWidth, lastWidth]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  // Update left width and save to localStorage
  const updateLeftWidth = useCallback((newWidth) => {
    const clamped = Math.max(28, Math.min(65, newWidth));
    setLeftWidth(clamped);
    setLastWidth(clamped);
    localStorage.setItem(persistKey, String(clamped));
  }, [persistKey]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || isCollapsed || !containerRef.current) return;
      
      // Use requestAnimationFrame for smooth drawing performance
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidthPx = e.clientX - containerRect.left;
        const newWidthPct = (newWidthPx / containerRect.width) * 100;
        updateLeftWidth(newWidthPct);
      });
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
  }, [isResizing, isCollapsed, updateLeftWidth]);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!isResizing || isCollapsed || !containerRef.current || !e.touches[0]) return;
      
      requestAnimationFrame(() => {
        if (!containerRef.current || !e.touches[0]) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const touchX = e.touches[0].clientX;
        const newWidthPx = touchX - containerRect.left;
        const newWidthPct = (newWidthPx / containerRect.width) * 100;
        updateLeftWidth(newWidthPct);
      });
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
  }, [isResizing, isCollapsed, updateLeftWidth]);

  return {
    leftWidth,
    lastWidth,
    isCollapsed,
    isResizing,
    containerRef,
    toggleCollapse,
    handleMouseDown,
    handleTouchStart,
  };
};
export default useSplitPanel;
