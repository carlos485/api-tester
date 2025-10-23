import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Environment } from '@/features/environments/types';
import type { ApiRequest } from '@/features/requests/types';
import { RequestMethodSelect } from '@/features/requests/components';
import type { HttpMethod } from '@/shared/types';
import { parseCurl, isCurlCommand } from '@/shared/utils';
import { VariableHighlightedInput } from '@/shared/components/ui';

interface QuickRequestBarProps {
  onSendRequest: (request: { method: string; url: string }) => void;
  environments: Environment[];
  selectedEnvironment: Environment | null;
  onEnvironmentChange: (environment: Environment | null) => void;
  initialMethod?: string;
  initialUrl?: string;
  onRequestChange?: (request: { method: string; url: string }) => void;
  onCurlParsed?: (request: ApiRequest) => void;
}

const QuickRequestBar: React.FC<QuickRequestBarProps> = ({
  onSendRequest,
  selectedEnvironment,
  initialMethod = "GET",
  initialUrl = "",
  onRequestChange,
  onCurlParsed
}) => {
  const [method, setMethod] = useState<HttpMethod>(initialMethod as HttpMethod);
  const [url, setUrl] = useState(initialUrl);

  // Sync with props when they change
  useEffect(() => {
    setMethod(initialMethod as HttpMethod);
  }, [initialMethod]);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  // Notify parent of changes
  const handleMethodChange = (newMethod: HttpMethod) => {
    setMethod(newMethod);
    if (onRequestChange) {
      onRequestChange({ method: newMethod, url });
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);

    // Check if the input looks like a cURL command
    if (isCurlCommand(newUrl) && onCurlParsed) {
      const parsedData = parseCurl(newUrl);
      if (parsedData) {
        let finalUrl = parsedData.url;

        // If environment is selected and URL starts with environment base URL, extract relative path
        if (selectedEnvironment && finalUrl.startsWith(selectedEnvironment.baseUrl)) {
          finalUrl = finalUrl.replace(selectedEnvironment.baseUrl, '');
          // Ensure it starts with /
          if (!finalUrl.startsWith('/')) {
            finalUrl = '/' + finalUrl;
          }
        }

        // Update local state
        setMethod(parsedData.method as HttpMethod);
        setUrl(finalUrl);

        // Create full request object for parent
        const fullRequest: ApiRequest = {
          method: parsedData.method,
          url: finalUrl,
          headers: parsedData.headers,
          queryParams: parsedData.queryParams,
          body: parsedData.body
        };

        // Notify parent about cURL parsing
        onCurlParsed(fullRequest);
        return;
      }
    }

    // Normal URL change
    if (onRequestChange) {
      onRequestChange({ method, url: newUrl });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');

    // Check if pasted content is a cURL command
    if (isCurlCommand(pastedText) && onCurlParsed) {
      e.preventDefault(); // Prevent default paste behavior

      const parsedData = parseCurl(pastedText);
      if (parsedData) {
        let finalUrl = parsedData.url;

        // If environment is selected and URL starts with environment base URL, extract relative path
        if (selectedEnvironment) {
          console.log('[QuickRequestBar] Parsed URL:', finalUrl);
          console.log('[QuickRequestBar] Environment baseUrl:', selectedEnvironment.baseUrl);

          // Normalize both URLs for comparison (remove trailing slashes)
          const normalizedBaseUrl = selectedEnvironment.baseUrl.replace(/\/$/, '');

          if (finalUrl.startsWith(normalizedBaseUrl)) {
            console.log('[QuickRequestBar] Extracting relative path...');
            finalUrl = finalUrl.replace(normalizedBaseUrl, '');
            // Ensure it starts with /
            if (!finalUrl.startsWith('/')) {
              finalUrl = '/' + finalUrl;
            }
            console.log('[QuickRequestBar] Final relative URL:', finalUrl);
          }
        }

        // Update local state
        setMethod(parsedData.method as HttpMethod);
        setUrl(finalUrl);

        // Create full request object for parent
        const fullRequest: ApiRequest = {
          method: parsedData.method,
          url: finalUrl,
          headers: parsedData.headers,
          queryParams: parsedData.queryParams,
          body: parsedData.body
        };

        // Notify parent about cURL parsing
        onCurlParsed(fullRequest);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Send the URL exactly as written in the input
      // The parent component (ProjectView) will handle concatenating baseUrl if needed
      onSendRequest({ method, url: url.trim() });
    }
  };

  return (
    <div className="mb-2">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Request Bar */}
        <div className="flex gap-2 items-center rounded-lg p-1">
          {/* Method Selector */}
          <div className="flex-shrink-0">
            <RequestMethodSelect
              value={method}
              onChange={handleMethodChange}
              variant="addon"
            />
          </div>

          {/* URL Input with Base URL chip and variable highlighting */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-2 border rounded-lg border-gray-300 bg-gray-50 focus-within:ring-1 focus-within:ring-gray-500 focus-within:border-gray-500 transition-all duration-200">
              {selectedEnvironment && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 ml-3 bg-blue-100 text-blue-800 text-xs font-medium rounded-md border border-blue-200 flex-shrink-0">
                  <Icon icon="material-symbols:cloud" className="h-3.5 w-3.5" />
                  {selectedEnvironment.baseUrl}
                </span>
              )}
              <VariableHighlightedInput
                value={url}
                onChange={handleUrlChange}
                onPaste={handlePaste}
                placeholder={
                  selectedEnvironment
                    ? "/api/endpoint or paste cURL command"
                    : "https://api.example.com/endpoint or paste cURL command"
                }
                required
              />
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="flex-shrink-0 cursor-pointer mt-2 transition-all duration-300 text-white border border-gray-500 bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            <Icon icon="mynaui:send" className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickRequestBar;
