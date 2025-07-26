import { getCMSConfig } from "../store/config-store";

/**
 * Gets the default container class
 * @returns The default container CSS class
 */
function getContainerClass(): string {
  return getCMSConfig().layout.container.default;
}

/**
 * Gets a container variant class
 * @param variant - The container variant to get
 * @returns The container variant CSS class
 */
function getContainerVariant(variant: "wide" | "narrow" | "fullWidth"): string {
  return getCMSConfig().layout.container.variants[variant];
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

export {
  getContainerClass,
  getContainerVariant,
  getHeadingClass,
  getBodyTextClass,
  getThemeColorClass,
  getButtonClass,
  getInputClass,
};
