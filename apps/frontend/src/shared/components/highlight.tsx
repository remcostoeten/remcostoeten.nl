type TProps = {
  children: React.ReactNode;
  color: string;
};

/**
 * A badge with background and text color derived from CSS custom properties
 * @param children - The content to render inside the badge
 * @param color - The color variant name that corresponds to --highlight-{color} CSS variable
 * @example
 * <HighlightBadge color="frontend">Frontend Development</HighlightBadge>
 * @example
 * <HighlightBadge color="backend">Backend Development</HighlightBadge>
 */
export function Highlight({ children, color }: TProps) {
  return (
    <span
      className="font-medium px-1 py-0.5 rounded"
      style={{
        backgroundColor: `hsl(var(--highlight-${color}) / 0.2)`,
        color: `hsl(var(--highlight-${color}))`
      }}
    >
      {children}
    </span>
  );
}
