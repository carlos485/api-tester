import { useState } from "react";

interface RequestFormProps {
  onSendRequest: (request: ApiRequest) => void;
}

interface ApiRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSendRequest }) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [useProxy, setUseProxy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch (error) {
      console.error("Invalid JSON in headers");
      return;
    }

    let finalUrl = url;
    if (useProxy && url.includes('solucionesdigitalfps.com')) {
      finalUrl = url.replace('https://uat-loyalty-fps-bus-ms-loyalty-gamification-ws.solucionesdigitalfps.com', '/api');
    }

    const request: ApiRequest = {
      method,
      url: finalUrl,
      headers: parsedHeaders,
      body,
    };

    onSendRequest(request);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
              Method
            </label>
            <select
              id="method"
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>
          <div className="flex-grow">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="use-proxy"
            type="checkbox"
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="use-proxy" className="ml-2 text-sm text-gray-700">
            Use proxy to bypass CORS (for solucionesdigitalfps.com)
          </label>
        </div>

        <div>
          <label htmlFor="headers" className="block text-sm font-medium text-gray-700 mb-2">
            Headers (JSON)
          </label>
          <textarea
            id="headers"
            placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            value={headers}
            onChange={e => setHeaders(e.target.value)}
            rows={3}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {(method === "POST" || method === "PUT" || method === "PATCH") && (
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Body
            </label>
            <textarea
              id="body"
              placeholder="Request body content"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Send Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
