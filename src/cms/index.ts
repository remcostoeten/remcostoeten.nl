export { getCMSConfig, setCMSConfig, updateCMSConfigSection, resetCMSConfig } from "./store/config-store";

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
} from "./utils/getters";

export {
  updateContainerWidth,
  updateContainerPaddingX,
  updateContainerPaddingY,
  updateSectionSpacing,
  updateContainerVariantWidth,
  updateResponsivePadding,
  updateMobileSpacing,
  resetContainerToDefaults,
} from "./utils/updaters";

export {
  generateContainerStyles,
  injectDynamicCSS,
} from "./utils/css-generators";

export { CMSContainer } from "./container";

export type { TCMSConfig, TLayoutConfig, TTypographyConfig, TColorConfig, TComponentConfig } from "./types/config";
