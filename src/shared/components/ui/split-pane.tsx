import { useEffect, useRef, useState } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

type TProps = {
  orientation: "vertical" | "horizontal";
  initialRatio?: number;
  onRatioChange?: (ratio: number) => void;
  leftOrTop: ReactNode;
  rightOrBottom: ReactNode;
};

export function SplitPane({
  orientation,
  initialRatio,
  onRatioChange,
  leftOrTop,
  rightOrBottom,
}: TProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [ratio, setRatio] = useState(typeof initialRatio === "number" ? initialRatio : 0.5);

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (orientation === "vertical") {
      const x = e.clientX - rect.left;
      const next = clamp(x / rect.width, 0.15, 0.85);
      setRatio(next);
      if (onRatioChange) onRatioChange(next);
    } else {
      const y = e.clientY - rect.top;
      const next = clamp(y / rect.height, 0.15, 0.85);
      setRatio(next);
      if (onRatioChange) onRatioChange(next);
    }
  }

  function stopDragging() {
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }

  function startDragging(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    let delta = 0;
    if (orientation === "vertical") {
      if (e.key === "ArrowLeft") delta = -0.02;
      if (e.key === "ArrowRight") delta = 0.02;
    } else {
      if (e.key === "ArrowUp") delta = -0.02;
      if (e.key === "ArrowDown") delta = 0.02;
    }
    if (delta !== 0) {
      e.preventDefault();
      const next = clamp(ratio + delta, 0.15, 0.85);
      setRatio(next);
      if (onRatioChange) onRatioChange(next);
    }
  }

  useEffect(function cleanupOnUnmount() {
    return function cleanup() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, []);

  const isVertical = orientation === "vertical";
  const containerClass = isVertical ? "flex flex-row w-full h-full" : "flex flex-col w-full h-full";
  const dividerClass = isVertical
    ? "w-1.5 cursor-col-resize bg-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] shrink-0"
    : "h-1.5 cursor-row-resize bg-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] shrink-0";

  const leftTopStyle = isVertical
    ? { flexBasis: `${ratio * 100}%` }
    : { height: `${ratio * 100}%` };

  return (
    <div ref={containerRef} className={containerClass}>
      <div className="min-w-[200px] min-h-[200px] overflow-auto" style={leftTopStyle}>
        {leftOrTop}
      </div>
      <div
        role="separator"
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        tabIndex={0}
        className={`${dividerClass} outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]`}
        style={{ touchAction: "none" }}
        onPointerDown={startDragging}
        onKeyDown={handleKeyDown}
      />
      <div className="flex-1 min-w-[200px] min-h-[200px] overflow-auto">
        {rightOrBottom}
      </div>
    </div>
  );
}
