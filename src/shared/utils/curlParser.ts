// Utility to parse cURL commands and extract request data
export interface ParsedCurlData {
  method: string;
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
}

export const parseCurl = (curlCommand: string): ParsedCurlData | null => {
  try {
    // Remove line breaks and normalize whitespace
    const normalizedCurl = curlCommand
      .replace(/\\\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Check if it's a curl command
    if (!normalizedCurl.toLowerCase().startsWith('curl')) {
      return null;
    }

    const result: ParsedCurlData = {
      method: 'GET',
      url: '',
      headers: {},
      queryParams: {},
      body: ''
    };

    // Split by spaces but keep quoted strings together
    const args = parseArgs(normalizedCurl);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Skip 'curl' command itself
      if (i === 0 && arg.toLowerCase() === 'curl') {
        continue;
      }

      // Handle method flags
      if (arg === '-X' || arg === '--request') {
        if (i + 1 < args.length) {
          result.method = args[i + 1].toUpperCase();
          i++; // Skip next argument
        }
      }
      // Handle headers
      else if (arg === '-H' || arg === '--header') {
        if (i + 1 < args.length) {
          const header = args[i + 1];
          const colonIndex = header.indexOf(':');
          if (colonIndex > 0) {
            const key = header.substring(0, colonIndex).trim();
            const value = header.substring(colonIndex + 1).trim();
            result.headers[key] = value;
          }
          i++; // Skip next argument
        }
      }
      // Handle data/body
      else if (arg === '-d' || arg === '--data' || arg === '--data-raw') {
        if (i + 1 < args.length) {
          result.body = args[i + 1];
          // If method is still GET and we have body data, change to POST
          if (result.method === 'GET') {
            result.method = 'POST';
          }
          i++; // Skip next argument
        }
      }
      // Handle form data
      else if (arg === '-F' || arg === '--form') {
        if (i + 1 < args.length) {
          // For now, just add it to body as form data
          const formData = args[i + 1];
          if (result.body) {
            result.body += '&' + formData;
          } else {
            result.body = formData;
          }
          // Set content-type for form data if not already set
          if (!result.headers['Content-Type'] && !result.headers['content-type']) {
            result.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
          // Change method to POST if still GET
          if (result.method === 'GET') {
            result.method = 'POST';
          }
          i++; // Skip next argument
        }
      }
      // Handle URL (usually the last argument without flags)
      else if (!arg.startsWith('-') && !result.url) {
        // Remove quotes if present
        result.url = removeQuotes(arg);
      }
    }

    // Parse query parameters from URL
    if (result.url) {
      const urlObj = new URL(result.url);
      const params: Record<string, string> = {};

      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      result.queryParams = params;

      // Remove query parameters from URL to get clean base URL
      result.url = urlObj.origin + urlObj.pathname;
    }

    return result;
  } catch (error) {
    console.error('Error parsing cURL command:', error);
    return null;
  }
};

// Helper function to parse arguments while preserving quoted strings
const parseArgs = (command: string): string[] => {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    const nextChar = command[i + 1];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      if (current.trim()) {
        args.push(current.trim());
        current = '';
      }
    } else if (char === '\\' && nextChar && inQuotes) {
      // Handle escaped characters in quotes
      current += nextChar;
      i++; // Skip next character
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
};

// Helper function to remove surrounding quotes
const removeQuotes = (str: string): string => {
  if ((str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
};

// Helper function to detect if a string looks like a cURL command
export const isCurlCommand = (text: string): boolean => {
  return text.trim().toLowerCase().startsWith('curl ');
};