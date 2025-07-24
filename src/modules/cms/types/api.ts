import { TCMSContent, ContentType } from './content';

export type TCMSResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: TPaginationInfo;
};

export type TPaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TCMSQuery = {
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

export type TCMSCreateRequest<T = any> = {
  type: ContentType;
  slug: string;
  data: T;
  status?: 'draft' | 'published';
};

export type TCMSUpdateRequest<T = any> = {
  data?: Partial<T>;
  status?: 'draft' | 'published' | 'archived';
};

export type TCMSBulkOperation = {
  action: 'publish' | 'unpublish' | 'archive' | 'delete';
  ids: string[];
};

export type TCMSMediaUpload = {
  file: File;
  alt?: string;
  caption?: string;
  folder?: string;
};

export type TCMSMediaItem = {
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

export type TCMSWebhook = {
  id: string;
  url: string;
  events: TCMSWebhookEvent[];
  secret?: string;
  active: boolean;
};

export type TCMSWebhookEvent = 
  | 'content.created'
  | 'content.updated'
  | 'content.deleted'
  | 'content.published'
  | 'content.unpublished';
