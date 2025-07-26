import type { TCMSConfig } from "../types/config";

const defaultConfig: TCMSConfig = {
  layout: {
    container: {
      default: "container-centered",
      variants: {
        wide: "container-wide",
        narrow: "container-narrow", 
        fullWidth: "w-full",
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
