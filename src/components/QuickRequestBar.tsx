import { useState } from "react";
import { Icon } from "@iconify/react";

interface QuickRequestBarProps {
  onSendRequest: (request: { method: string; url: string }) => void;
}

const QuickRequestBar: React.FC<QuickRequestBarProps> = ({ onSendRequest }) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSendRequest({ method, url: url.trim() });
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 items-center bg-white rounded-lg border border-gray-300 shadow-sm p-1">
          <select
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="GET" selected>
              GET
            </option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="px-4 py-3 cursor-pointer bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 px-4 py-3 text-gray-900 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-3 cursor-pointer border-2 rounded-lg border-gray-600 hover:bg-gray-600 hover:text-white text-gray-600 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-colors"
          >
            <Icon icon="mynaui:send" className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickRequestBar;
