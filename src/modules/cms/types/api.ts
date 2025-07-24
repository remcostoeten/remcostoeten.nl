import { CMSContent, ContentType } from './content';

export interface CMSResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CMSQuery {
  type?: ContentType;
  status?: 'draft' | 'published' | 'archived';
  slug?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface CMSCreateRequest<T = any> {
  type: ContentType;
  slug: string;
  data: T;
  status?: 'draft' | 'published';
}

export interface CMSUpdateRequest<T = any> {
  data?: Partial<T>;
  status?: 'draft' | 'published' | 'archived';
}

export interface CMSBulkOperation {
  action: 'publish' | 'unpublish' | 'archive' | 'delete';
  ids: string[];
}

export interface CMSMediaUpload {
  file: File;
  alt?: string;
  caption?: string;
  folder?: string;
}

export interface CMSMediaItem {
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
}

export interface CMSWebhook {
  id: string;
  url: string;
  events: CMSWebhookEvent[];
  secret?: string;
  active: boolean;
}

export type CMSWebhookEvent = 
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.unpublished';