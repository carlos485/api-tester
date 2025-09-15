export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string; // Icon identifier from iconify
  createdAt: Date;
  updatedAt: Date;
  environments: Environment[];
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  variables?: Record<string, string>; // Environment variables
}

export interface ApiRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

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