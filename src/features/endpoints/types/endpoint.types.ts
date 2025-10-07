import type { HttpMethod } from '@/shared/types';

export interface Endpoint {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  method: HttpMethod;
  url: string;
  folder?: string;
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EndpointFolder {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  parentId?: string; // For nested folders
  createdAt: Date;
  updatedAt: Date;
}
