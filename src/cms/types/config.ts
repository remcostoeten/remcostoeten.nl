type TLayoutConfig = {
  container: {
    default: string;
    variants: {
      wide: string;
      narrow: string;
      fullWidth: string;
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
