/**
 * Simple CMS utilities that return static Tailwind classes
 * Perfect foundation for a future content management system
 */

/**
 * Gets the default container class
 * @returns The default container CSS class
 */
function getContainerClass(): string {
  return "cms-container";
}

/**
 * Gets a container variant class
 * @param variant - The container variant to get
 * @returns The container variant CSS class
 */
function getContainerVariant(variant: "wide" | "narrow" | "fullWidth"): string {
  const variantMap = {
    wide: "cms-container-wide",
    narrow: "cms-container-narrow",
    fullWidth: "cms-container-full",
  };
  return variantMap[variant];
}

/**
 * Gets a heading class by level
 * @param level - The heading level (h1-h6)
 * @returns The heading CSS class
 */
function getHeadingClass(level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): string {
  const headings = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-semibold",
    h3: "text-2xl font-semibold",
    h4: "text-xl font-semibold",
    h5: "text-lg font-medium",
    h6: "text-base font-medium",
  };
  return headings[level];
}

/**
 * Gets a body text class
 * @param size - The body text size variant
 * @returns The body text CSS class
 */
function getBodyTextClass(size: "default" | "small" | "large" = "default"): string {
  const sizes = {
    default: "text-base",
    small: "text-sm",
    large: "text-lg",
  };
  return sizes[size];
}

/**
 * Gets a theme color class
 * @param color - The theme color to get
 * @returns The theme color CSS class
 */
function getThemeColorClass(color: "primary" | "secondary" | "accent" | "background" | "foreground"): string {
  const colors = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    background: "bg-background",
    foreground: "text-foreground",
  };
  return colors[color];
}

/**
 * Gets a complete paragraph class string
 * @param type - The paragraph type
 * @returns The combined CSS class string
 */
function getParagraphClass(type: "hero" | "body" | "caption" | "quote"): string {
  const paragraphs = {
    hero: "text-lg font-medium leading-relaxed",
    body: "text-base leading-normal",
    caption: "text-sm text-muted-foreground leading-normal",
    quote: "text-lg italic leading-relaxed",
  };
  return paragraphs[type];
}

export {
  getContainerClass,
  getContainerVariant,
  getHeadingClass,
  getBodyTextClass,
  getThemeColorClass,
  getParagraphClass,
};
