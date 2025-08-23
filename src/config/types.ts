type TColorShade = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

type TColorPalette = {
  primary: TColorShade;
  secondary: TColorShade;
  accent: TColorShade;
  neutral: TColorShade;
  success: TColorShade;
  warning: TColorShade;
  error: TColorShade;
  info: TColorShade;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  highlightFrontend: string;
  highlightProduct: string;
};

type TFontFamily = {
  sans: string[];
  serif: string[];
  mono: string[];
  display: string[];
};

type TFontSize = {
  xs: [string, { lineHeight: string; letterSpacing?: string }];
  sm: [string, { lineHeight: string; letterSpacing?: string }];
  base: [string, { lineHeight: string; letterSpacing?: string }];
  lg: [string, { lineHeight: string; letterSpacing?: string }];
  xl: [string, { lineHeight: string; letterSpacing?: string }];
  '2xl': [string, { lineHeight: string; letterSpacing?: string }];
  '3xl': [string, { lineHeight: string; letterSpacing?: string }];
  '4xl': [string, { lineHeight: string; letterSpacing?: string }];
  '5xl': [string, { lineHeight: string; letterSpacing?: string }];
  '6xl': [string, { lineHeight: string; letterSpacing?: string }];
  '7xl': [string, { lineHeight: string; letterSpacing?: string }];
  '8xl': [string, { lineHeight: string; letterSpacing?: string }];
  '9xl': [string, { lineHeight: string; letterSpacing?: string }];
};

type TFontWeight = {
  thin: string;
  extralight: string;
  light: string;
  normal: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
  black: string;
};

type TLineHeight = {
  none: string;
  tight: string;
  snug: string;
  normal: string;
  relaxed: string;
  loose: string;
};

type TLetterSpacing = {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
};

type TTypography = {
  fontFamily: TFontFamily;
  fontSize: TFontSize;
  fontWeight: TFontWeight;
  lineHeight: TLineHeight;
  letterSpacing: TLetterSpacing;
};

type TSpacing = {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
  'form-field': string;
  section: string;
};

type TBorderRadius = {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
  secondary: string;
  container: string;
};

type TShadow = {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  hover: string;
  focus: string;
  active: string;
};

type TBreakpoint = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
};

type TTransition = {
  duration: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  timing: {
    linear: string;
    in: string;
    out: string;
    'in-out': string;
  };
};

type TAnimation = {
  spin: string;
  ping: string;
  pulse: string;
  bounce: string;
  fadeIn: string;
  fadeOut: string;
  slideIn: string;
  slideOut: string;
};

type TZIndex = {
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  auto: string;
};

type TOpacity = {
  0: string;
  5: string;
  10: string;
  20: string;
  25: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  75: string;
  80: string;
  90: string;
  95: string;
  100: string;
};

type TLayout = {
  containerMaxWidth: string;
};

export type TDesignTokens = {
  colors: TColorPalette;
  typography: TTypography;
  spacing: TSpacing;
  borderRadius: TBorderRadius;
  shadows: TShadow;
  breakpoints: TBreakpoint;
  transitions: TTransition;
  animations: TAnimation;
  zIndex: TZIndex;
  opacity: TOpacity;
  layout: TLayout;
};

export type TSeoConfig = {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  twitterCard: string;
};

export type TSiteConfig = {
  title: string;
  favicon: string;
  metaDescription: string;
  metaKeywords: string;
  seo: TSeoConfig;
};

export type TConfig = {
  site: TSiteConfig;
  designTokens: TDesignTokens;
};
