import type { TCMSConfig } from "../types/config";
import { defaultConfig } from "../config/default";

let currentConfig: TCMSConfig = { ...defaultConfig };

/**
 * Gets the current CMS configuration
 * @returns The current CMS configuration object
 */
function getCMSConfig(): TCMSConfig {
  return currentConfig;
}

/**
 * Updates the entire CMS configuration
 * @param newConfig - The new configuration object to set
 */
function setCMSConfig(newConfig: TCMSConfig): void {
  currentConfig = { ...newConfig };
}

/**
 * Updates a specific section of the CMS configuration
 * @param section - The configuration section to update
 * @param newSectionConfig - The new configuration for that section
 */
function updateCMSConfigSection<K extends keyof TCMSConfig>(
  section: K,
  newSectionConfig: TCMSConfig[K]
): void {
  currentConfig = {
    ...currentConfig,
    [section]: newSectionConfig,
  };
}

/**
 * Resets the CMS configuration to default values
 */
function resetCMSConfig(): void {
  currentConfig = { ...defaultConfig };
}

export {
  getCMSConfig,
  setCMSConfig,
  updateCMSConfigSection,
  resetCMSConfig,
};
