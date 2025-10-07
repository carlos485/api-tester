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
