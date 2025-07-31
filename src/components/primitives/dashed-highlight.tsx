import { JSX } from "solid-js";

type TProps = {
  children: JSX.Element;
  strokeColor?: string;
  strokeWidth?: number;
  radius?: number;
  dashArray?: string;
  class?: string;
  spacing?: number;
  variant?: "special";
};

export function DashedHighlight(props: TProps) {
  const {
    strokeColor: propStrokeColor,
    strokeWidth: propStrokeWidth,
    radius = 4,
    dashArray = "4, 4",
    class: className = "",
    spacing = 2,
    variant,
  } = props;

  const isSpecial = variant === "special";

  const strokeColor = isSpecial
    ? "rgb(202 255 128 / 20%)"
    : propStrokeColor ?? "hsl(var(--muted-foreground) / 0.5)";
  const strokeWidth = isSpecial ? 1 : propStrokeWidth ?? 2;

  return (
    <span class={`relative inline-block ${className}`}>
      <span class="relative z-10 px-1">{props.children}</span>
      <svg
        class="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2 + spacing}
          width={100 - strokeWidth}
          height={100 - strokeWidth - spacing * 2}
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
