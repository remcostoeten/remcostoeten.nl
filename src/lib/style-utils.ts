type TButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type TButtonSize = "sm" | "md" | "lg";

function getButtonClasses(variant: TButtonVariant = "primary", size: TButtonSize = "md"): string {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent text-background hover:bg-accent/90 focus:ring-accent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    ghost: "hover:bg-muted hover:text-foreground focus:ring-muted",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
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
  const baseClasses = "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  
  const states = {
    default: "border-border focus-visible:ring-accent",
    error: "border-destructive focus-visible:ring-destructive",
    success: "border-accent focus-visible:ring-accent"
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
  getBadgeClasses,
  getPageClasses,
  getSectionClasses
};
