type TButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "outlined" | "link" | "admin";
type TButtonSize = "sm" | "md" | "lg";

function getButtonClasses(variant: TButtonVariant = "admin", size: TButtonSize = "md"): string {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    ghost: "hover:bg-muted hover:text-foreground focus:ring-muted",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
    outlined: "theme-link inline-block px-6 py-3 border border-border rounded-md hover:bg-muted transition-all duration-300 ease-in-out hover:border-accent/50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:-translate-y-0.5",
    link: "theme-link text-foreground hover:text-accent transition-colors underline-offset-4 hover:underline",
    admin: "bg-background border-2 border-border hover:border-accent/50 text-foreground hover:-translate-y-0.5 focus:ring-accent"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg"
  };
  
  return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
}

function getCardClasses(variant: "default" | "muted" | "accent" = "default"): string {
  const baseClasses = "rounded-lg border transition-colors";
  
  const variants = {
    default: "bg-card text-card-foreground border-border",
    muted: "bg-muted/50 text-foreground border-border/50",
    accent: "bg-accent/10 text-foreground border-accent/20"
  };
  
  return `${baseClasses} ${variants[variant]}`;
}

function getLinkClasses(variant: "default" | "theme" | "muted" = "theme"): string {
  const variants = {
    default: "text-foreground hover:text-accent transition-colors",
    theme: "theme-link",
    muted: "text-muted-foreground hover:text-foreground transition-colors"
  };
  
  return variants[variant];
}

function getInputClasses(state: "default" | "error" | "success" = "default"): string {
  const baseClasses = "flex h-10 w-full rounded-md border bg-background text-gray-200 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  
  const states = {
    default: "border-border focus:border-accent/60 hover:border-border/80",
    error: "border-destructive focus:border-destructive/80 hover:border-destructive/60",
    success: "border-accent focus:border-accent/80 hover:border-accent/60"
  };
  
  return `${baseClasses} ${states[state]}`;
}

function getTextareaClasses(state: "default" | "error" | "success" = "default"): string {
  const baseClasses = "flex w-full rounded-md border bg-background text-red-200 px-3 py-2 text-sm placeholder:text-red-400 focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  
  const states = {
    default: "border-border focus:border-accent/60 hover:border-border/80",
    error: "border-destructive focus:border-destructive/80 hover:border-destructive/60",
    success: "border-accent focus:border-accent/80 hover:border-accent/60"
  };
  
  return `${baseClasses} ${states[state]}`;
}

function getBadgeClasses(variant: "default" | "secondary" | "accent" | "destructive" = "default"): string {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    accent: "bg-accent/10 text-accent border border-accent/20",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80"
  };
  
  return `${baseClasses} ${variants[variant]}`;
}

function getPageClasses(): string {
  return "min-h-screen bg-background text-foreground";
}

function getSectionClasses(): string {
  return "py-12 md:py-16 lg:py-20";
}

export {
  getButtonClasses,
  getCardClasses,
  getLinkClasses,
  getInputClasses,
  getTextareaClasses,
  getBadgeClasses,
  getPageClasses,
  getSectionClasses
};
