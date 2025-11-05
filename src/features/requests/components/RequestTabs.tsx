import { useState } from "react";
import { Tabs, Tab } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import type { ApiRequest } from '@/features/requests/types';
import { generateCurl, copyCurlToClipboard } from '@/shared/utils';

interface RequestTabsProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
}

const RequestTabs: React.FC<RequestTabsProps> = ({ request, onRequestChange }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [curlCopied, setCurlCopied] = useState(false);

  // Generate cURL command
  const generatedCurl = generateCurl(request);

  const handleCopyCurl = async () => {
    const success = await copyCurlToClipboard(generatedCurl);
    if (success) {
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 2000);
    }
  };

  const handleBodyChange = (newBody: string) => {
    onRequestChange({
      ...request,
      body: newBody,
    });
  };

  return (
    <div className="rounded-lg">
      <Tabs
        variant="underline"
        defaultActiveTab={activeTabIndex}
        onTabChange={setActiveTabIndex}
      >
        <Tab header="Parameters">
          <div className="space-y-4">
            {/* Parameters table will be implemented here */}
          </div>
        </Tab>
        <Tab header="Headers">
          <div className="space-y-4">
            {/* Headers table will be implemented here */}
          </div>
        </Tab>

        <Tab header="Body">
          <div className="space-y-4">
            <div className="flex flex-col h-full">
              <textarea
                value={request.body || ""}
                onChange={(e) => handleBodyChange(e.target.value)}
                className="w-full h-64 p-3 text-sm font-mono border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-200 resize-none"
                placeholder='Enter request body (e.g., JSON: {"key": "value"})'
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>Enter the raw request body. For JSON, make sure to add "Content-Type: application/json" in Headers.</p>
              </div>
            </div>
          </div>
        </Tab>

        <Tab header="cURL">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">cURL Command</h3>
              <Button
                onClick={handleCopyCurl}
                icon={curlCopied ? "material-symbols:check" : "material-symbols:content-copy"}
                variant="secondary"
                size="sm"
              >
                {curlCopied ? "Copied!" : "Copy cURL"}
              </Button>
            </div>

            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{generatedCurl}</code>
              </pre>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>This cURL command can be used in your terminal or imported into other API testing tools.</p>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default RequestTabs;
