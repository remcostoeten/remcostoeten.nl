type TLayoutConfig = {
  container: {
    maxWidth: number; // in pixels
    paddingX: number; // in rem
    paddingY: number; // in rem
    marginX: 'auto' | 'none';
    spacing: number; // space between sections in rem
    variants: {
      wide: {
        maxWidth: number;
        paddingX: number;
      };
      narrow: {
        maxWidth: number;
        paddingX: number;
      };
      fullWidth: {
        maxWidth: string; // '100%' or 'none'
        paddingX: number;
      };
    };
    responsive: {
      mobile: {
        paddingX: number;
        spacing: number;
      };
      tablet: {
        paddingX: number;
      };
      desktop: {
        paddingX: number;
      };
    };
  };
};

type TTypographyConfig = {
  headings: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    h5: string;
    h6: string;
  };
  body: {
    default: string;
    small: string;
    large: string;
  };
  lineHeight: {
    global: string;
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
    none: string;
  };
  paragraphs: {
    hero: {
      class: string;
      lineHeight: string;
    };
    body: {
      class: string;
      lineHeight: string;
    };
    caption: {
      class: string;
      lineHeight: string;
    };
    quote: {
      class: string;
      lineHeight: string;
    };
  };
};

type TColorConfig = {
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
};

type TComponentConfig = {
  button: {
    variants: {
      primary: string;
      secondary: string;
      ghost: string;
    };
    sizes: {
      small: string;
      medium: string;
      large: string;
    };
  };
  input: {
    default: string;
    error: string;
    success: string;
  };
};

type TCMSConfig = {
  layout: TLayoutConfig;
  typography: TTypographyConfig;
  colors: TColorConfig;
  components: TComponentConfig;
};

export type {
  TCMSConfig,
  TLayoutConfig,
  TTypographyConfig,
  TColorConfig,
  TComponentConfig,
};
