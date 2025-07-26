import type { TCMSConfig } from "../types/config";

const defaultConfig: TCMSConfig = {
  layout: {
    container: {
      maxWidth: 896, // equivalent to max-w-4xl
      paddingX: 1, // 1rem
      paddingY: 2, // 2rem
      marginX: 'auto',
      spacing: 4, // 4rem between sections
      variants: {
        wide: {
          maxWidth: 1280, // max-w-7xl
          paddingX: 2,
        },
        narrow: {
          maxWidth: 640, // max-w-2xl
          paddingX: 1,
        },
        fullWidth: {
          maxWidth: '100%',
          paddingX: 1,
        },
      },
      responsive: {
        mobile: {
          paddingX: 1,
          spacing: 2, // reduced spacing on mobile
        },
        tablet: {
          paddingX: 1.5,
        },
        desktop: {
          paddingX: 2,
        },
      },
    },
  },
  typography: {
    headings: {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-semibold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
    },
    body: {
      default: "text-base",
      small: "text-sm",
      large: "text-lg",
    },
    lineHeight: {
      global: "leading-[1.7]",
      tight: "leading-tight",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
      none: "leading-none",
    },
    paragraphs: {
      hero: {
        class: "text-lg font-medium",
        lineHeight: "leading-relaxed",
      },
      body: {
        class: "text-base",
        lineHeight: "leading-normal",
      },
      caption: {
        class: "text-sm text-muted-foreground",
        lineHeight: "leading-normal",
      },
      quote: {
        class: "text-lg italic",
        lineHeight: "leading-relaxed",
      },
    },
  },
  colors: {
    theme: {
      primary: "text-primary",
      secondary: "text-secondary", 
      accent: "text-accent",
      background: "bg-background",
      foreground: "text-foreground",
    },
  },
  components: {
    button: {
      variants: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      sizes: {
        small: "h-8 px-3 text-sm",
        medium: "h-10 px-4",
        large: "h-12 px-8 text-lg",
      },
    },
    input: {
      default: "border border-input bg-background px-3 py-2 text-sm",
      error: "border-destructive focus:border-destructive",
      success: "border-green-500 focus:border-green-500",
    },
  },
};

export { defaultConfig };
