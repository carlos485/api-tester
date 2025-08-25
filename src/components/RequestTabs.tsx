import { useState } from "react";
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
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b border-gray-200 hover:bg-gray-50">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          id="checkbox-table-search-1"
                          type="checkbox"
                          className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-900"
                        />
                        <label
                          htmlFor="checkbox-table-search-1"
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        id="first_name"
                        className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        placeholder="Añadir un nuevo parámetro"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        id="first_name"
                        className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        required
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        id="first_name"
                        className="border-0 text-gray-900 text-sm rounded-lg hover:bg-gray-50 hover:border hover:border-gray-300 focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                        required
                      />
                    </td>
                  </tr>
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
