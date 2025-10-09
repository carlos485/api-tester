import { parseCurl } from './src/shared/utils/curlParser.ts';

const curlCommand = `curl 'https://dev-secret-manager-ws.solucionestifps.com/api/v1/secret?secretId=secret-cupomania-mongo-db-dev' \
  -H 'app-key: secretManagerId' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'Referer: http://localhost:5173/' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"' \
  -H 'sec-ch-ua-mobile: ?0'`;

const result = parseCurl(curlCommand);
console.log('Parsed URL:', result.url);
console.log('Query Params:', result.queryParams);
