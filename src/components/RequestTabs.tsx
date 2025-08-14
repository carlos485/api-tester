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
            <div className="text-gray-500 text-sm">Parameters tab content</div>
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
