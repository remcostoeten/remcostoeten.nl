import { getSiteConfig } from '../../config/site';

export const CONTACT_EMOJIS = ["😊", "🔥", "💡", "👏", "❤️", "🚀"];

function getSocialLinks() {
  const config = getSiteConfig();
  return {
    x: config.social.x,
    github: config.social.github,
    behance: config.social.behance,
    telegram: config.social.telegram
  };
}

export const SOCIAL_LINKS = getSocialLinks();
