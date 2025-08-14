import { useState } from "react";

interface RequestTabsProps {
  // Props will be added when needed
}

const RequestTabs: React.FC<RequestTabsProps> = () => {
  const [activeTab, setActiveTab] = useState<"params" | "headers">("params");

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("params")}
            className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "params"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-500 hover:border-gray-500"
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "headers"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-500 hover:border-gray-500"
            }`}
          >
            Headers
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "params" && (
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
        )}

        {activeTab === "headers" && (
          <div className="space-y-4">
            {/* Headers content will be added here */}
            <div className="text-gray-500 text-sm">Headers tab content</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTabs;
