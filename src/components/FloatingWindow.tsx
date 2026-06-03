import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface FloatingWindowProps {
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  initialX?: number;
  initialY?: number;
  children: React.ReactNode;
  rightHeaderActions?: React.ReactNode;
}

export default function FloatingWindow({
  onClose,
  title,
  subtitle,
  icon,
  initialWidth = 900,
  initialHeight = 600,
  minWidth = 500,
  minHeight = 400,
  initialX,
  initialY,
  children,
  rightHeaderActions
}: FloatingWindowProps) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Position at the absolute center on mount
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const targetX = initialX !== undefined ? initialX : Math.max(16, (w - size.width) / 2);
    const targetY = initialY !== undefined ? initialY : Math.max(32, (h - size.height) / 2);
    setPos({ x: targetX, y: targetY });
  }, []);

  const dragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;

    // Check if clicking inside form inputs, buttons, scrollbars, etc.
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea") ||
      target.closest(".scroller")
    ) {
      return;
    }

    e.preventDefault();
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Keep inside boundary values roughly
      const nextX = Math.min(Math.max(4, moveEvent.clientX - startX), window.innerWidth - 100);
      const nextY = Math.min(Math.max(4, moveEvent.clientY - startY), window.innerHeight - 100);
      setPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();

    const startWidth = size.width;
    const startHeight = size.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const computedWidth = Math.max(minWidth, startWidth + (moveEvent.clientX - startX));
      const computedHeight = Math.max(minHeight, startHeight + (moveEvent.clientY - startY));
      setSize({
        width: Math.min(computedWidth, window.innerWidth - 30),
        height: Math.min(computedHeight, window.innerHeight - 30)
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClickHeader = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }
    setIsMaximized(!isMaximized);
  };

  // Custom styling depending on Maximized view
  const style: React.CSSProperties = isMaximized
    ? {
        position: "fixed",
        top: "12px",
        left: "12px",
        width: "calc(100vw - 24px)",
        height: "calc(100vh - 24px)",
        zIndex: 50
      }
    : {
        position: "fixed",
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 50
      };

  return (
    <div
      ref={containerRef}
      style={style}
      className="bg-[#0b0b0f] border-2 border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.15)] flex flex-col transition-all duration-75 select-none"
    >
      {/* Glow highlight strip */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-554 via-purple-554 to-pink-554 animate-pulse shrink-0" />

      {/* Header bar */}
      <div
        onMouseDown={dragStart}
        onDoubleClick={handleDoubleClickHeader}
        className="bg-[#121217] border-b border-indigo-950/45 px-5 py-3.5 flex justify-between items-center bg-gradient-to-r from-neutral-900 via-[#121217] to-neutral-950 cursor-move text-white shrink-0 active:bg-[#14141d] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-indigo-400 shrink-0">{icon}</div>}
          <div className="select-none pointer-events-none">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 font-bold">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightHeaderActions}
          
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isMaximized ? "Wiederherstellen" : "Maximieren"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-450 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 hover:text-red-400 transition-all cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Window Body Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#07070b]/98 relative">
        {children}
      </div>

      {/* Bottom corner resize handle tag */}
      {!isMaximized && (
        <div
          onMouseDown={resizeStart}
          className="absolute bottom-0 right-0 w-5.5 h-5.5 cursor-se-resize flex items-end justify-end p-0.5 z-50 group"
          title="Größe anpassen"
        >
          {/* Decorative resize diagonal hatch lines */}
          <svg className="w-3.5 h-3.5 text-neutral-600 group-hover:text-indigo-400 transition-colors pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="2" y2="22" />
            <line x1="22" y1="8" x2="8" y2="22" />
            <line x1="22" y1="14" x2="14" y2="22" />
          </svg>
        </div>
      )}
    </div>
  );
}
