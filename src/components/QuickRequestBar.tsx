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
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="transition-all bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block p-2.5"
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
          {/* <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 px-4 py-3 text-gray-900 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            required
          /> */}
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
            placeholder="Enter URL"
            required
          />
          <button
            type="submit"
            className="cursor-pointer mt-2 transition-all duration-300 text-gray-500 hover:text-white border border-gray-500 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            <Icon icon="mynaui:send" className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickRequestBar;
