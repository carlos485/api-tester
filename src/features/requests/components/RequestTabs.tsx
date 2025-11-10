import { useState } from "react";
import { Tabs, Tab, VariableHighlightedInput, InputV2 } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import type { ApiRequest } from '@/features/requests/types';
import { generateCurl, copyCurlToClipboard } from '@/shared/utils';

interface RequestTabsProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
}

interface ParamRow {
  id: string;
  enabled: boolean;
  name: string;
  value: string;
  description: string;
}

const RequestTabs: React.FC<RequestTabsProps> = ({ request, onRequestChange }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [curlCopied, setCurlCopied] = useState(false);

  // Convert query params to array for table display
  const paramsToArray = (params: Record<string, string>): ParamRow[] => {
    return Object.entries(params).map(([name, value]) => ({
      id: `param-${Date.now()}-${Math.random()}`,
      enabled: true,
      name,
      value,
      description: '',
    }));
  };

  const [paramRows, setParamRows] = useState<ParamRow[]>(() => {
    const existingParams = paramsToArray(request.queryParams || {});
    return [...existingParams, {
      id: `new-param-${Date.now()}`,
      enabled: true,
      name: '',
      value: '',
      description: '',
    }];
  });

  const updateRequestParams = (rows: ParamRow[]) => {
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

  const handleParamChange = (id: string, field: keyof ParamRow, value: string | boolean) => {
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
          type: 'text',
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
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-70 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      title="Toggle all"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paramRows.map((param, index) => (
                  <tr
                    key={param.id}
                    className="bg-white border-b dark:bg-gray-80 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => handleParamChange(param.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600"
                        style={{ accentColor: '#16a34a' }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <InputV2
                        variant="ghost"
                        value={param.name}
                        onChange={(e) => handleParamChange(param.id, 'name', e.target.value)}
                        placeholder={index === paramRows.length - 1 ? "Name" : ""}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <VariableHighlightedInput
                        value={param.value}
                        onChange={(value) => handleParamChange(param.id, 'value', value)}
                        placeholder={index === paramRows.length - 1 ? "Value" : ""}
                        className="block w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <InputV2
                        variant="ghost"
                        value={param.description}
                        onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                        placeholder={index === paramRows.length - 1 ? "Description" : ""}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {paramRows.filter(row => row.name.trim() || row.value.trim()).length >= 2 && (param.name.trim() || param.value.trim()) && (
                        <button
                          onClick={() => handleDeleteParam(param.id)}
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
