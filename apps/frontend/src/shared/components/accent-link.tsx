type TProps = {
  children: React.ReactNode;
};

/**
 * A clickable accent link with dotted border and hover effects
 * @param children - The content to render inside the link
 * @example
 * <AccentLink>Product Design</AccentLink>
 */
export function AccentLink({ children }: TProps) {
  return (
    <span className="text-accent hover:underline font-medium hover:no-underline
 cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded transition-colors duration-200">
      {children}
    </span>
  );
}
