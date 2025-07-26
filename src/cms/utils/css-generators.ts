import { getCMSConfig } from "../store/config-store";

/**
 * Generates dynamic container CSS styles
 * @param variant - Container variant to use
 * @returns CSS style object
 */
function generateContainerStyles(variant?: "wide" | "narrow" | "fullWidth"): Record<string, string> {
  const config = getCMSConfig().layout.container;
  
  if (variant && config.variants[variant]) {
    const variantConfig = config.variants[variant];
    return {
      maxWidth: typeof variantConfig.maxWidth === 'number' ? `${variantConfig.maxWidth}px` : variantConfig.maxWidth,
      paddingLeft: `${variantConfig.paddingX}rem`,
      paddingRight: `${variantConfig.paddingX}rem`,
      paddingTop: `${config.paddingY}rem`,
      paddingBottom: `${config.paddingY}rem`,
      marginLeft: config.marginX,
      marginRight: config.marginX,
    };
  }

  return {
    maxWidth: `${config.maxWidth}px`,
    paddingLeft: `${config.paddingX}rem`,
    paddingRight: `${config.paddingX}rem`,
    paddingTop: `${config.paddingY}rem`,
    paddingBottom: `${config.paddingY}rem`,
    marginLeft: config.marginX,
    marginRight: config.marginX,
  };
}

/**
 * Generates container spacing CSS for child elements
 * @returns CSS style object for spacing
 */
function generateContainerSpacing(): Record<string, string> {
  const config = getCMSConfig().layout.container;
  return {
    marginTop: `${config.spacing}rem`,
  };
}

/**
 * Generates responsive container CSS
 * @returns CSS media queries object
 */
function generateResponsiveContainerCSS(): string {
  const config = getCMSConfig().layout.container;
  
  return `
    /* Mobile styles */
    @media (max-width: 640px) {
      .cms-container {
        padding-left: ${config.responsive.mobile.paddingX}rem;
        padding-right: ${config.responsive.mobile.paddingX}rem;
      }
      .cms-container > * + * {
        margin-top: ${config.responsive.mobile.spacing}rem;
      }
    }
    
    /* Tablet styles */
    @media (min-width: 640px) {
      .cms-container {
        padding-left: ${config.responsive.tablet.paddingX}rem;
        padding-right: ${config.responsive.tablet.paddingX}rem;
      }
    }
    
    /* Desktop styles */
    @media (min-width: 1024px) {
      .cms-container {
        padding-left: ${config.responsive.desktop.paddingX}rem;
        padding-right: ${config.responsive.desktop.paddingX}rem;
      }
    }
  `;
}

/**
 * Injects dynamic CSS into the document
 */
function injectDynamicCSS(): void {
  // Only run on client side
  if (typeof document === 'undefined') {
    return;
  }

  const existingStyle = document.getElementById('cms-dynamic-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'cms-dynamic-styles';
  
  const config = getCMSConfig().layout.container;
  
  style.textContent = `
    .cms-container {
      max-width: ${config.maxWidth}px;
      margin-left: ${config.marginX};
      margin-right: ${config.marginX};
      padding-left: ${config.paddingX}rem;
      padding-right: ${config.paddingX}rem;
      padding-top: ${config.paddingY}rem;
      padding-bottom: ${config.paddingY}rem;
    }
    
    .cms-container > * + * {
      margin-top: ${config.spacing}rem;
    }
    
    .cms-container-wide {
      max-width: ${config.variants.wide.maxWidth}px;
      padding-left: ${config.variants.wide.paddingX}rem;
      padding-right: ${config.variants.wide.paddingX}rem;
      padding-top: ${config.paddingY}rem;
      padding-bottom: ${config.paddingY}rem;
      margin-left: ${config.marginX};
      margin-right: ${config.marginX};
    }
    
    .cms-container-narrow {
      max-width: ${config.variants.narrow.maxWidth}px;
      padding-left: ${config.variants.narrow.paddingX}rem;
      padding-right: ${config.variants.narrow.paddingX}rem;
      padding-top: ${config.paddingY}rem;
      padding-bottom: ${config.paddingY}rem;
      margin-left: ${config.marginX};
      margin-right: ${config.marginX};
    }
    
    .cms-container-full {
      max-width: ${config.variants.fullWidth.maxWidth};
      padding-left: ${config.variants.fullWidth.paddingX}rem;
      padding-right: ${config.variants.fullWidth.paddingX}rem;
      padding-top: ${config.paddingY}rem;
      padding-bottom: ${config.paddingY}rem;
      margin-left: ${config.marginX};
      margin-right: ${config.marginX};
    }
    
    ${generateResponsiveContainerCSS()}
  `;
  
  document.head.appendChild(style);
}

export {
  generateContainerStyles,
  generateContainerSpacing,
  generateResponsiveContainerCSS,
  injectDynamicCSS,
};
