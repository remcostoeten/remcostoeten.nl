// Types
export type {
  CMSContent,
  ContentType,
  HeroContent,
  AboutContent,
  ProjectContent,
  ContactContent,
  PageContent,
  SiteSettings,
  NavigationContent,
  ExperienceItem,
  ProjectImage,
  ProjectMetrics,
  SocialLink,
  PageSection,
  NavigationItem
} from './types/content';

export type {
  CMSResponse,
  CMSQuery,
  CMSCreateRequest,
  CMSUpdateRequest,
  CMSBulkOperation,
  CMSMediaUpload,
  CMSMediaItem,
  CMSWebhook,
  CMSWebhookEvent,
  PaginationInfo
} from './types/api';

// Services
export { CMSService } from './services/cmsService';
export { StaticCMSAdapter } from './adapters/staticAdapter';

// Hooks
export {
  configureCMS,
  useCMSService,
  useCMSContent,
  useHeroContent,
  useAboutContent,
  useProjectsContent,
  useContactContent,
  useSiteSettings,
  useNavigationContent,
  useCMSContentBySlug,
  useCMSCreateContent,
  useCMSUpdateContent,
  useCMSDeleteContent,
  useCMSUploadMedia,
  useCMSMedia,
  useCMSCacheInvalidation,
  useCMSPreview
} from './hooks/useCMS';

// Providers
export {
  CMSProvider,
  useCMSContext,
  withCMS,
  CMSThemeProvider
} from './providers/CMSProvider';

// Components
export { CMSSection, CMSContentWrapper } from './components/CMSSection';
export { PreviewBanner } from './components/PreviewBanner';

// Static hooks (fallback)
export {
  useStaticHeroContent,
  useStaticAboutContent,
  useStaticProjectsContent,
  useStaticContactContent,
  useStaticSiteSettings,
  useStaticNavigationContent
} from './hooks/useStaticCMS';

// Utilities
export * from './utils/contentHelpers';