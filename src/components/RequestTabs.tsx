import { useState } from "react";
import { Icon } from "@iconify/react";
import { Tabs, Tab } from "./Tabs";
import type { ApiRequest } from "../types/project";

interface RequestTabsProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
}

interface HeaderRow {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

interface ParamRow {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

const RequestTabs: React.FC<RequestTabsProps> = ({ request, onRequestChange }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Convert headers object to array for table display
  const headersToArray = (headers: Record<string, string>): HeaderRow[] => {
    return Object.entries(headers).map(([key, value]) => ({
      id: `header-${Date.now()}-${Math.random()}`,
      key,
      value,
      description: "",
      enabled: true,
    }));
  };

  const [headerRows, setHeaderRows] = useState<HeaderRow[]>(() => {
    const existingHeaders = headersToArray(request.headers);
    // Always add one empty row for new headers
    return [...existingHeaders, {
      id: `new-header-${Date.now()}`,
      key: "",
      value: "",
      description: "",
      enabled: true,
    }];
  });

  // Convert query params object to array for table display
  const paramsToArray = (params: Record<string, string>): ParamRow[] => {
    return Object.entries(params).map(([key, value]) => ({
      id: `param-${Date.now()}-${Math.random()}`,
      key,
      value,
      description: "",
      enabled: true,
    }));
  };

  const [paramRows, setParamRows] = useState<ParamRow[]>(() => {
    const existingParams = paramsToArray(request.queryParams || {});
    // Always add one empty row for new params
    return [...existingParams, {
      id: `new-param-${Date.now()}`,
      key: "",
      value: "",
      description: "",
      enabled: true,
    }];
  });

  // Update request headers when headerRows change
  const updateRequestHeaders = (rows: HeaderRow[]) => {
    const headers: Record<string, string> = {};
    rows.forEach(row => {
      if (row.key.trim() && row.value.trim() && row.enabled) {
        headers[row.key.trim()] = row.value.trim();
      }
    });
    
    onRequestChange({
      ...request,
      headers,
    });
  };

  // Update request query params when paramRows change
  const updateRequestParams = (rows: ParamRow[]) => {
    const queryParams: Record<string, string> = {};
    rows.forEach(row => {
      if (row.key.trim() && row.value.trim() && row.enabled) {
        queryParams[row.key.trim()] = row.value.trim();
      }
    });
    
    onRequestChange({
      ...request,
      queryParams,
    });
  };

  const handleHeaderChange = (id: string, field: keyof HeaderRow, value: string | boolean) => {
    setHeaderRows(prev => {
      const newRows = prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      );
      
      // If the last row (empty row) is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (lastRow && (lastRow.key || lastRow.value) && lastRow.id.startsWith('new-header')) {
        newRows.push({
          id: `new-header-${Date.now()}`,
          key: "",
          value: "",
          description: "",
          enabled: true,
        });
      }
      
      updateRequestHeaders(newRows);
      return newRows;
    });
  };

  const handleParamChange = (id: string, field: keyof ParamRow, value: string | boolean) => {
    setParamRows(prev => {
      const newRows = prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      );
      
      // If the last row (empty row) is being edited, add a new empty row
      const lastRow = newRows[newRows.length - 1];
      if (lastRow && (lastRow.key || lastRow.value) && lastRow.id.startsWith('new-param')) {
        newRows.push({
          id: `new-param-${Date.now()}`,
          key: "",
          value: "",
          description: "",
          enabled: true,
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

  const handleDeleteHeader = (id: string) => {
    setHeaderRows(prev => {
      const newRows = prev.filter(row => row.id !== id);
      updateRequestHeaders(newRows);
      return newRows;
    });
  };
  return (
    <div className="bg-white rounded-lg">
      <Tabs 
        variant="underline"
        defaultActiveTab={activeTabIndex}
        onTabChange={setActiveTabIndex}
      >
        <Tab header="Parameters">
          <div className="space-y-4">
            {/* Parameters content will be added here */}
            <div className="text-gray-500 text-sm">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="checkbox-all-search"
                          className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-900"
                        />
                        <label
                          htmlFor="checkbox-all-search"
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Key
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 w-12">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paramRows.map((param, index) => (
                    <tr key={param.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-param-${param.id}`}
                            type="checkbox"
                            checked={param.enabled}
                            onChange={(e) => handleParamChange(param.id, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-900"
                          />
                          <label
                            htmlFor={`checkbox-param-${param.id}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                          placeholder={index === paramRows.length - 1 ? "Añadir un nuevo parámetro" : ""}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={param.description}
                          onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        />
                      </td>
                      <td className="py-2 px-2">
                        {paramRows.filter(row => row.key.trim() || row.value.trim()).length >= 2 && (param.key.trim() || param.value.trim()) && (
                          <button
                            onClick={() => handleDeleteParam(param.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-all duration-200"
                            title="Delete parameter"
                          >
                            <Icon icon="line-md:trash" className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tab>
        <Tab header="Headers">
          <div className="space-y-4">
            {/* Headers content will be added here */}
            <div className="text-gray-500 text-sm">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="checkbox-all-search-headers"
                          className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-900"
                        />
                        <label
                          htmlFor="checkbox-all-search-headers"
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Key
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 w-12">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {headerRows.map((header, index) => (
                    <tr key={header.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-header-${header.id}`}
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => handleHeaderChange(header.id, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-900"
                          />
                          <label
                            htmlFor={`checkbox-header-${header.id}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                          placeholder={index === headerRows.length - 1 ? "Añadir un nuevo header" : ""}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={header.description}
                          onChange={(e) => handleHeaderChange(header.id, 'description', e.target.value)}
                          className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        />
                      </td>
                      <td className="py-2 px-2">
                        {headerRows.filter(row => row.key.trim() || row.value.trim()).length >= 2 && (header.key.trim() || header.value.trim()) && (
                          <button
                            onClick={() => handleDeleteHeader(header.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-all duration-200"
                            title="Delete header"
                          >
                            <Icon icon="line-md:trash" className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default RequestTabs;
