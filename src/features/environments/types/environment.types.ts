export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  variables?: Record<string, string>; // Environment variables
}
