import { useState } from "react";
import { Tabs, Tab, EditableTable, type EditableRow, Button } from '@/shared/components/ui';
import type { ApiRequest } from '@/features/requests/types';
import { generateCurl, copyCurlToClipboard } from '@/shared/utils';

interface RequestTabsProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
  availableVariables?: Record<string, string>;
}

const RequestTabs: React.FC<RequestTabsProps> = ({ request, onRequestChange, availableVariables = {} }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [curlCopied, setCurlCopied] = useState(false);

  // Convert query params to array for table display
  const paramsToArray = (params: Record<string, string>): EditableRow[] => {
    return Object.entries(params).map(([name, value]) => ({
      id: `param-${Date.now()}-${Math.random()}`,
      enabled: true,
      name,
      value,
      description: '',
    }));
  };

  // Convert headers to array for table display
  const headersToArray = (headers: Record<string, string>): EditableRow[] => {
    return Object.entries(headers).map(([name, value]) => ({
      id: `header-${Date.now()}-${Math.random()}`,
      enabled: true,
      name,
      value,
      description: '',
    }));
  };

  const [paramRows, setParamRows] = useState<EditableRow[]>(() => {
    const existingParams = paramsToArray(request.queryParams || {});
    return [...existingParams, {
      id: `new-param-${Date.now()}`,
      enabled: true,
      name: '',
      value: '',
      description: '',
    }];
  });

  const [headerRows, setHeaderRows] = useState<EditableRow[]>(() => {
    const existingHeaders = headersToArray(request.headers || {});
    return [...existingHeaders, {
      id: `new-header-${Date.now()}`,
      enabled: true,
      name: '',
      value: '',
      description: '',
    }];
  });

  const updateRequestParams = (rows: EditableRow[]) => {
    const queryParams: Record<string, string> = {};
    rows.forEach(row => {
      if (row.name.trim() && row.enabled) {
        queryParams[row.name.trim()] = row.value;
      }
    });

    onRequestChange({
      ...request,
      queryParams,
    });
  };

  const handleParamChange = (id: string, field: keyof EditableRow, value: string | boolean) => {
    setParamRows(prev => {
      const newRows = prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // If the last row is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (lastRow && (lastRow.name || lastRow.value) && lastRow.id.startsWith('new-param')) {
        newRows.push({
          id: `new-param-${Date.now()}`,
          enabled: true,
          name: '',
          value: '',
          description: '',
        });
      }

      updateRequestParams(newRows);
      return newRows;
    });
  };

  const handleDeleteParam = (id: string) => {
    setParamRows(prev => {
      const newRows = prev.filter(row => row.id !== id);
      updateRequestParams(newRows);
      return newRows;
    });
  };

  // Headers management functions
  const updateRequestHeaders = (rows: EditableRow[]) => {
    const headers: Record<string, string> = {};
    rows.forEach(row => {
      if (row.name.trim() && row.enabled) {
        headers[row.name.trim()] = row.value;
      }
    });

    onRequestChange({
      ...request,
      headers,
    });
  };

  const handleHeaderChange = (id: string, field: keyof EditableRow, value: string | boolean) => {
    setHeaderRows(prev => {
      const newRows = prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      );

      // If the last row is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (lastRow && (lastRow.name || lastRow.value) && lastRow.id.startsWith('new-header')) {
        newRows.push({
          id: `new-header-${Date.now()}`,
          enabled: true,
          name: '',
          value: '',
          description: '',
        });
      }

      updateRequestHeaders(newRows);
      return newRows;
    });
  };

  const handleDeleteHeader = (id: string) => {
    setHeaderRows(prev => {
      const newRows = prev.filter(row => row.id !== id);
      updateRequestHeaders(newRows);
      return newRows;
    });
  };

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
          <EditableTable
            rows={paramRows}
            onRowChange={handleParamChange}
            onDeleteRow={handleDeleteParam}
            availableVariables={availableVariables}
          />
        </Tab>
        <Tab header="Headers">
          <EditableTable
            rows={headerRows}
            onRowChange={handleHeaderChange}
            onDeleteRow={handleDeleteHeader}
            availableVariables={availableVariables}
          />
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
