import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import https from 'https';

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());
app.use(express.text());

// Create HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Proxy endpoint
app.all('/proxy', async (req, res) => {
  try {
    const targetUrl = req.headers['x-target-url'];

    if (!targetUrl) {
      return res.status(400).json({
        error: 'Missing x-target-url header'
      });
    }

    console.log(`[PROXY] ${req.method} ${targetUrl}`);

    // Prepare headers (exclude host and other problematic headers)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['x-target-url'];
    delete headers['content-length'];
    delete headers.connection;

    // Make the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      agent: targetUrl.startsWith('https') ? httpsAgent : undefined
    });

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response
    res.status(response.status).send(data);

  } catch (error) {
    console.error('[PROXY ERROR]', error.message);
    res.status(500).json({
      error: 'Proxy request failed',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔄 Proxy server running on http://localhost:${PORT}`);
  console.log(`   Use header: x-target-url: <your-api-url>`);
});
