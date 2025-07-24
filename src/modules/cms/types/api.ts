import { CMSContent, ContentType } from './content';

export type CMSResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
};

export type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CMSQuery = {
  type?: ContentType;
  status?: 'draft' | 'published' | 'archived';
  slug?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
};

export type CMSCreateRequest<T = any> = {
  type: ContentType;
  slug: string;
  data: T;
  status?: 'draft' | 'published';
};

export type CMSUpdateRequest<T = any> = {
  data?: Partial<T>;
  status?: 'draft' | 'published' | 'archived';
};

export type CMSBulkOperation = {
  action: 'publish' | 'unpublish' | 'archive' | 'delete';
  ids: string[];
};

export type CMSMediaUpload = {
  file: File;
  alt?: string;
  caption?: string;
  folder?: string;
};

export type CMSMediaItem = {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  alt?: string;
  caption?: string;
  folder?: string;
  createdAt: string;
  updatedAt: string;
};

export type CMSWebhook = {
  id: string;
  url: string;
  events: CMSWebhookEvent[];
  secret?: string;
  active: boolean;
};

export type CMSWebhookEvent = 
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.unpublished';