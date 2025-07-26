import { getCMSConfig } from "../store/config-store";
import { safeInjectCSS } from "../client-init";

/**
 * Gets the default container class (now dynamic)
 * @returns The default container CSS class
 */
function getContainerClass(): string {
  safeInjectCSS(); // Ensure latest styles are injected (client-side only)
  return "cms-container";
}

/**
 * Gets a container variant class (now dynamic)
 * @param variant - The container variant to get
 * @returns The container variant CSS class
 */
function getContainerVariant(variant: "wide" | "narrow" | "fullWidth"): string {
  safeInjectCSS(); // Ensure latest styles are injected (client-side only)
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
  return getCMSConfig().typography.headings[level];
}

/**
 * Gets a body text class
 * @param size - The body text size variant
 * @returns The body text CSS class
 */
function getBodyTextClass(size: "default" | "small" | "large" = "default"): string {
  return getCMSConfig().typography.body[size];
}

/**
 * Gets a theme color class
 * @param color - The theme color to get
 * @returns The theme color CSS class
 */
function getThemeColorClass(color: "primary" | "secondary" | "accent" | "background" | "foreground"): string {
  return getCMSConfig().colors.theme[color];
}

/**
 * Gets a button class with variant and size
 * @param variant - The button variant
 * @param size - The button size
 * @returns The combined button CSS classes
 */
function getButtonClass(
  variant: "primary" | "secondary" | "ghost" = "primary",
  size: "small" | "medium" | "large" = "medium"
): string {
  const config = getCMSConfig().components.button;
  return `${config.variants[variant]} ${config.sizes[size]}`;
}

/**
 * Gets an input class with state
 * @param state - The input state
 * @returns The input CSS class
 */
function getInputClass(state: "default" | "error" | "success" = "default"): string {
  return getCMSConfig().components.input[state];
}

/**
 * Gets a line height class
 * @param variant - The line height variant
 * @returns The line height CSS class
 */
function getLineHeightClass(variant: "global" | "tight" | "normal" | "relaxed" | "loose" | "none" = "normal"): string {
  return getCMSConfig().typography.lineHeight[variant];
}

/**
 * Gets a paragraph configuration with combined classes
 * @param type - The paragraph type
 * @returns Object with combined class and lineHeight
 */
function getParagraphConfig(type: "hero" | "body" | "caption" | "quote"): { class: string; lineHeight: string; combined: string } {
  const config = getCMSConfig().typography.paragraphs[type];
  return {
    class: config.class,
    lineHeight: config.lineHeight,
    combined: `${config.class} ${config.lineHeight}`,
  };
}

/**
 * Gets a complete paragraph class string
 * @param type - The paragraph type
 * @returns The combined CSS class string
 */
function getParagraphClass(type: "hero" | "body" | "caption" | "quote"): string {
  const config = getCMSConfig().typography.paragraphs[type];
  return `${config.class} ${config.lineHeight}`;
}

export {
  getContainerClass,
  getContainerVariant,
  getHeadingClass,
  getBodyTextClass,
  getThemeColorClass,
  getButtonClass,
  getInputClass,
  getLineHeightClass,
  getParagraphConfig,
  getParagraphClass,
};
