export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string; // Icon identifier from iconify
  color?: string; // Background color for the card
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
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
}