import { useState } from 'react';
import { Button, Select, TextInput, Label, Textarea, Card } from 'flowbite-react';

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
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedHeaders = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch (error) {
      console.error('Invalid JSON in headers');
      return;
    }

    const request: ApiRequest = {
      method,
      url,
      headers: parsedHeaders,
      body
    };

    onSendRequest(request);
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Label htmlFor="method" value="Method" />
            <Select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-32"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </Select>
          </div>
          <div className="flex-grow">
            <Label htmlFor="url" value="URL" />
            <TextInput
              id="url"
              type="url"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="headers" value="Headers (JSON)" />
          <Textarea
            id="headers"
            placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            rows={3}
          />
        </div>

        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div>
            <Label htmlFor="body" value="Body" />
            <Textarea
              id="body"
              placeholder="Request body content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
            />
          </div>
        )}

        <Button type="submit" className="w-full">
          Send Request
        </Button>
      </form>
    </Card>
  );
};

export default RequestForm;