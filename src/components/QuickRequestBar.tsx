import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Environment } from "../types/project";
import RequestMethodSelect, { type HttpMethod } from "./RequestMethodSelect";
import Input from "./Input";

interface QuickRequestBarProps {
  onSendRequest: (request: { method: string; url: string }) => void;
  environments?: Environment[];
}

const QuickRequestBar: React.FC<QuickRequestBarProps> = ({ onSendRequest }) => {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("");
  const [selectedEnvironment] = useState<Environment | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let finalUrl = url.trim();

      // If environment is selected and URL is relative, prepend base URL
      if (selectedEnvironment && !finalUrl.startsWith("http")) {
        finalUrl =
          selectedEnvironment.baseUrl.replace(/\/$/, "") +
          "/" +
          finalUrl.replace(/^\//, "");
      }

      onSendRequest({ method, url: finalUrl });
    }
  };

  return (
    <div className="mb-2">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 items-center bg-white rounded-lg p-1">
          <Input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            variant="full-width"
            leftAddon={
              <RequestMethodSelect
                value={method}
                onChange={setMethod}
                variant="addon"
              />
            }
            placeholder={
              selectedEnvironment
                ? "/api/endpoint or full URL"
                : "https://api.example.com/endpoint"
            }
            required
          />
          <button
            type="submit"
            className="cursor-pointer mt-2 transition-all duration-300 text-white border border-gray-500 bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            <Icon icon="mynaui:send" className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickRequestBar;
