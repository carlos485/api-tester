import type { ApiRequest } from '../types/project';

export interface CurlOptions {
  indent?: boolean;
  timeout?: number;
}

export function generateCurl(request: ApiRequest, baseUrl?: string, options: CurlOptions = {}): string {
  const { indent = true, timeout = 30 } = options;
  
  let url = request.url;
  if (baseUrl && !url.startsWith('http')) {
    url = `${baseUrl.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  // Start building the curl command
  let curl = 'curl';
  
  // Add method if not GET
  if (request.method && request.method !== 'GET') {
    curl += ` -X ${request.method}`;
  }
  
  // Add headers
  if (request.headers && Object.keys(request.headers).length > 0) {
    for (const [key, value] of Object.entries(request.headers)) {
      if (value.trim()) {
        curl += indent ? ` \\\n  -H "${escapeString(key)}: ${escapeString(value)}"` : ` -H "${escapeString(key)}: ${escapeString(value)}"`;
      }
    }
  }
  
  // Add body for methods that support it
  if (request.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      // Try to parse as JSON to validate and format
      const parsedBody = JSON.parse(request.body);
      const formattedBody = JSON.stringify(parsedBody);
      curl += indent ? ` \\\n  -d '${escapeString(formattedBody)}'` : ` -d '${escapeString(formattedBody)}'`;
    } catch {
      // If not valid JSON, treat as plain text
      curl += indent ? ` \\\n  -d '${escapeString(request.body)}'` : ` -d '${escapeString(request.body)}'`;
    }
  }
  
  // Add timeout
  curl += indent ? ` \\\n  --connect-timeout ${timeout}` : ` --connect-timeout ${timeout}`;
  
  // Add URL (always last)
  curl += indent ? ` \\\n  "${escapeString(url)}"` : ` "${escapeString(url)}"`;
  
  return curl;
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/"/g, '\\"')    // Escape quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t');  // Escape tabs
}

export async function copyCurlToClipboard(curl: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(curl);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = curl;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}