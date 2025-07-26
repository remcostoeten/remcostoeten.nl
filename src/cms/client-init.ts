import { onMount } from 'solid-js';
import { injectDynamicCSS } from './utils/css-generators';

/**
 * Initialize CMS on client side only
 * Use this in components that need dynamic CSS
 */
function initializeCMS(): void {
  onMount(() => {
    injectDynamicCSS();
  });
}

/**
 * Safe client-side CSS injection
 * Can be called multiple times safely
 */
function safeInjectCSS(): void {
  if (typeof window !== 'undefined') {
    injectDynamicCSS();
  }
}

export { initializeCMS, safeInjectCSS };
