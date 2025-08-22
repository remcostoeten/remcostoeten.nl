import { TConfig, TDesignTokens } from './types';

function generateColorShade(base: string) {
  return {
    50: base,
    100: base,
    200: base,
    300: base,
    400: base,
    500: base,
    600: base,
    700: base,
    800: base,
    900: base,
    950: base,
  };
}

export const cmsConfig: TConfig = {
  site: {
    title: 'My Portfolio',
    favicon: '',
    metaDescription: '',
    metaKeywords: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
      twitterCard: '',
    },
  },
  designTokens: {
    colors: {
      primary: generateColorShade('#4F46E5'),
      secondary: generateColorShade('#6B7280'),
      accent: generateColorShade('#8B5CF6'),
      neutral: generateColorShade('#171717'),
      success: generateColorShade('#10B981'),
      warning: generateColorShade('#F59E0B'),
      error: generateColorShade('#EF4444'),
      info: generateColorShade('#3B82F6'),
      background: 'hsl(0 0% 7%)',
      foreground: 'hsl(0 0% 85%)',
      card: 'hsl(0 0% 7%)',
      cardForeground: 'hsl(0 0% 85%)',
      popover: 'hsl(0 0% 7%)',
      popoverForeground: 'hsl(0 0% 85%)',
      muted: 'hsl(0 0% 12%)',
      mutedForeground: 'hsl(0 0% 65%)',
      border: 'hsl(0 0% 20%)',
      input: 'hsl(0 0% 12%)',
      ring: 'hsl(85 100% 75%)',
      highlightFrontend: 'hsl(85 100% 75%)',
      highlightProduct: 'hsl(85 100% 75%)',
    },
    typography: {
      fontFamily: {
        sans: ['Inter Variable', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['Inter Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
      'form-field': '16px',
      section: '32px',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '8px',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
      secondary: '4px',
      container: '12px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 4px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      hover: '0 2px 8px rgba(0, 0, 0, 0.12)',
      focus: '0 0 0 3px rgba(66, 153, 225, 0.5)',
      active: '0 0 0 3px rgba(66, 153, 225, 0.7)',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    transitions: {
      duration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
      timing: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    animations: {
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      fadeIn: 'fadeIn 0.5s ease-in-out',
      fadeOut: 'fadeOut 0.5s ease-in-out',
      slideIn: 'slideIn 0.3s ease-out',
      slideOut: 'slideOut 0.3s ease-in',
    },
    zIndex: {
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      auto: 'auto',
    },
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      40: '0.4',
      50: '0.5',
      60: '0.6',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      90: '0.9',
      95: '0.95',
      100: '1',
    },
  },
};

export function toCssVariables(tokens: TDesignTokens): Record<string, string> {
  const cssVars: Record<string, string> = {};

  cssVars['--background'] = tokens.colors.background;
  cssVars['--foreground'] = tokens.colors.foreground;
  cssVars['--card'] = tokens.colors.card;
  cssVars['--card-foreground'] = tokens.colors.cardForeground;
  cssVars['--popover'] = tokens.colors.popover;
  cssVars['--popover-foreground'] = tokens.colors.popoverForeground;
  cssVars['--primary'] = tokens.colors.primary[500];
  cssVars['--primary-foreground'] = '#ffffff';
  cssVars['--secondary'] = tokens.colors.secondary[500];
  cssVars['--secondary-foreground'] = '#ffffff';
  cssVars['--muted'] = tokens.colors.muted;
  cssVars['--muted-foreground'] = tokens.colors.mutedForeground;
  cssVars['--accent'] = tokens.colors.accent[500];
  cssVars['--accent-foreground'] = '#ffffff';
  cssVars['--destructive'] = tokens.colors.error[500];
  cssVars['--destructive-foreground'] = '#ffffff';
  cssVars['--border'] = tokens.colors.border;
  cssVars['--input'] = tokens.colors.input;
  cssVars['--ring'] = tokens.colors.ring;
  cssVars['--highlight-frontend'] = tokens.colors.highlightFrontend;
  cssVars['--highlight-product'] = tokens.colors.highlightProduct;

  cssVars['--radius'] = tokens.borderRadius.DEFAULT;
  cssVars['--radius-secondary'] = tokens.borderRadius.secondary;
  cssVars['--radius-container'] = tokens.borderRadius.container;

  cssVars['--font-sans'] = tokens.typography.fontFamily.sans.join(', ');
  cssVars['--font-serif'] = tokens.typography.fontFamily.serif.join(', ');
  cssVars['--font-mono'] = tokens.typography.fontFamily.mono.join(', ');

  return cssVars;
}

export function toTailwindTheme(tokens: TDesignTokens) {
  const colorShades: Record<string, Record<string | number, string>> = {};
  
  ['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error', 'info'].forEach((colorName) => {
    const color = tokens.colors[colorName as keyof typeof tokens.colors];
    if (typeof color === 'object' && '500' in color) {
      colorShades[colorName] = color;
    }
  });

  return {
    colors: {
      ...colorShades,
      background: tokens.colors.background,
      foreground: tokens.colors.foreground,
      card: tokens.colors.card,
      'card-foreground': tokens.colors.cardForeground,
      popover: tokens.colors.popover,
      'popover-foreground': tokens.colors.popoverForeground,
      muted: {
        DEFAULT: tokens.colors.muted,
        foreground: tokens.colors.mutedForeground,
      },
      border: tokens.colors.border,
      input: tokens.colors.input,
      ring: tokens.colors.ring,
      'highlight-frontend': tokens.colors.highlightFrontend,
      'highlight-product': tokens.colors.highlightProduct,
      destructive: {
        DEFAULT: tokens.colors.error[500],
        foreground: '#ffffff',
      },
    },
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize,
    fontWeight: tokens.typography.fontWeight,
    lineHeight: tokens.typography.lineHeight,
    letterSpacing: tokens.typography.letterSpacing,
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.shadows,
    screens: tokens.breakpoints,
    transitionDuration: tokens.transitions.duration,
    transitionTimingFunction: tokens.transitions.timing,
    animation: tokens.animations,
    zIndex: tokens.zIndex,
    opacity: tokens.opacity,
  };
}

export function applyDesignTokens(tokens: TDesignTokens): void {
  const cssVars = toCssVariables(tokens);
  const root = document.documentElement;
  
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
