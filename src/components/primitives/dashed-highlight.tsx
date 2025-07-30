import { JSX } from "solid-js";

type TProps = {
  children: JSX.Element;
  strokeColor?: string; 
  strokeWidth?: number;
  radius?: number;
  dashArray?: string; 
  class?: string; 
};

export function DashedHighlight(props: TProps) {
  const {
    strokeColor = "hsl(var(--muted-foreground) / 0.5)",
    strokeWidth = 4,
    radius = 6 ,
    dashArray = "6, 6",
    class: className = "",
  } = props;

  return (
    <span class={`relative inline-block ${className}`}>
      <span class="relative z-10 px-2 py-1">{props.children}</span>
      <svg
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={100 - strokeWidth}
          height={100 - strokeWidth}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={strokeColor}
          stroke-width={strokeWidth}
          stroke-dasharray={dashArray}
          class="dashed-highlight-border"
        />
      </svg>
    </span>
  );
}
