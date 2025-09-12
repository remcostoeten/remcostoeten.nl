export interface User {
  name: string;
  avatar: string;
  timestamp: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  isActive: boolean;
}

export interface NavigationProps {
  user?: User;
  navigationItems?: NavigationItem[];
  subscribeHref?: string;
  className?: string;
}

export interface NavigationLinkProps {
  item: NavigationItem;
}

export interface SubscribeButtonProps {
  href: string;
}

export interface UserProfileProps {
  user: User;
}