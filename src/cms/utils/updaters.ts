import { updateCMSConfigSection } from "../store/config-store";
import { safeInjectCSS } from "../client-init";
import type { TLayoutConfig } from "../types/config";

/**
 * Updates container max width (for slider control)
 * @param width - Width in pixels
 */
function updateContainerWidth(width: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      maxWidth: width,
    },
  });
  safeInjectCSS();
}

/**
 * Updates container horizontal padding (for slider control)
 * @param padding - Padding in rem
 */
function updateContainerPaddingX(padding: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      paddingX: padding,
    },
  });
  injectDynamicCSS();
}

/**
 * Updates container vertical padding (for slider control)
 * @param padding - Padding in rem
 */
function updateContainerPaddingY(padding: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      paddingY: padding,
    },
  });
  injectDynamicCSS();
}

/**
 * Updates section spacing (for slider control)
 * @param spacing - Spacing in rem
 */
function updateSectionSpacing(spacing: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      spacing: spacing,
    },
  });
  injectDynamicCSS();
}

/**
 * Updates container variant width (for slider control)
 * @param variant - Container variant
 * @param width - Width in pixels
 */
function updateContainerVariantWidth(variant: "wide" | "narrow" | "fullWidth", width: number | string): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      variants: {
        ...currentLayout.container.variants,
        [variant]: {
          ...currentLayout.container.variants[variant],
          maxWidth: width,
        },
      },
    },
  });
  injectDynamicCSS();
}

/**
 * Updates responsive breakpoint padding (for slider control)
 * @param breakpoint - Responsive breakpoint
 * @param padding - Padding in rem
 */
function updateResponsivePadding(breakpoint: "mobile" | "tablet" | "desktop", padding: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      responsive: {
        ...currentLayout.container.responsive,
        [breakpoint]: {
          ...currentLayout.container.responsive[breakpoint],
          paddingX: padding,
        },
      },
    },
  });
  injectDynamicCSS();
}

/**
 * Updates mobile section spacing (for slider control)
 * @param spacing - Spacing in rem
 */
function updateMobileSpacing(spacing: number): void {
  const currentLayout = getCurrentLayoutConfig();
  updateCMSConfigSection('layout', {
    ...currentLayout,
    container: {
      ...currentLayout.container,
      responsive: {
        ...currentLayout.container.responsive,
        mobile: {
          ...currentLayout.container.responsive.mobile,
          spacing: spacing,
        },
      },
    },
  });
  injectDynamicCSS();
}

/**
 * Gets current layout configuration for updates
 */
function getCurrentLayoutConfig(): TLayoutConfig {
  const { getCMSConfig } = require("../store/config-store");
  return getCMSConfig().layout;
}

/**
 * Resets container to default values
 */
function resetContainerToDefaults(): void {
  const { defaultConfig } = require("../config/default");
  updateCMSConfigSection('layout', defaultConfig.layout);
  injectDynamicCSS();
}

export {
  updateContainerWidth,
  updateContainerPaddingX,
  updateContainerPaddingY,
  updateSectionSpacing,
  updateContainerVariantWidth,
  updateResponsivePadding,
  updateMobileSpacing,
  resetContainerToDefaults,
};
