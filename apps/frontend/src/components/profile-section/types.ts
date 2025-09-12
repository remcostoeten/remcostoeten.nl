export interface SocialLink {
  label: string;
  href: string;
}

export interface PortfolioLink {
  text: string;
  href: string;
}

export interface ProfileSectionProps {
  welcomeIcon?: string;
  name?: string;
  title?: string;
  company?: string;
  description?: string;
  portfolioLink?: PortfolioLink;
  socialLinks?: SocialLink[];
  logoImage?: string;
  className?: string;
}