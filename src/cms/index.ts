export { getCMSConfig, setCMSConfig, updateCMSConfigSection, resetCMSConfig } from "./store/config-store";

export {
  getContainerClass,
  getContainerVariant,
  getHeadingClass,
  getBodyTextClass,
  getThemeColorClass,
  getButtonClass,
  getInputClass,
} from "./utils/getters";

export { CMSContainer } from "./container";

export type { TCMSConfig, TLayoutConfig, TTypographyConfig, TColorConfig, TComponentConfig } from "./types/config";
