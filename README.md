<div align="center">
	<h1>CorexUrl</h1>
	<p><strong>Backend Server for URL Masking & API Proxy</strong></p>
	<p>Production-ready server for Corex URL masking service.</p>
	<br>
	<a href="https://github.com/Corex24/CorexUrl"><img src="https://img.shields.io/github/license/Corex24/CorexUrl" alt="License"></a>
	<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen" alt="Node.js"></a>
	<a href="https://vercel.com"><img src="https://img.shields.io/badge/deploy-vercel-black" alt="Deploy on Vercel"></a>
	<br>
	<br>
	<a href="https://corexanthony.vercel.app">Live Demo</a> •
	<a href="#api-endpoints">API Docs</a> •
	<a href="#deployment">Deploy</a> •
	<a href="https://github.com/Corex24/CorexUrl/issues">Report Bug</a>
	<br>
	<br>
</div>

---

## Features

- **Universal URL Masking** - Automatically detects and masks media from any source (TikTok, YouTube, Movie APIs, etc.)
- **Smart Heuristic Engine** - Catch-all format detection that identifies any file-type (MP4, MKV, MP3, SRT, etc.) without a whitelist.
- **Header Transparency** - Preserves original behavior (streaming vs downloading) by proxying upstream headers.
- **JSON Proxying** - Deep-traversal masking for complex API responses.
- **Secure Storage** - Built-in support for Upstash Redis (production) and In-Memory storage (development).
- **Vercel Optimized** - Pre-configured for seamless deployment with `vercel.json`.

---

## Quick Start

### Installation

```bash
git clone https://github.com/Corex24/CorexUrl.git
cd CorexUrl
npm install
```

### Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:23480`

### Deploy to Vercel

```bash
vercel deploy
```

---

## API Endpoints

### POST `/corex/register`

Register and mask a single URL.

**Request:**
```bash
curl -X POST http://localhost:23480/corex/register \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/video.mp4"}'
```

**Response:**
```json
{
  "success": true,
  "corexId": "cx_abc123def456",
  "corexUrl": "https://corexanthony.vercel.app/corex/cx_abc123def456.mp4"
}
```

### POST `/corex/proxy-json`

Mask all URLs in a JSON object.

**Request:**
```bash
curl -X POST http://localhost:23480/corex/proxy-json \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "title": "My Video",
      "video": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/thumb.jpg"
    }
  }'
```

**Response:**
```json
{
  "wrappedJson": {
    "title": "My Video",
    "video": "https://corexanthony.vercel.app/corex/cx_123.mp4",
    "thumbnail": "https://corexanthony.vercel.app/corex/cx_456.jpg"
  }
}
```

### GET `/corex/:id`

Retrieve and stream original media for a masked URL.

**Request:**
```bash
curl http://localhost:23480/corex/cx_abc123def456.mp4
```

**Response:** Streams the original file with appropriate content-type headers

---

## Project Structure

```
CorexUrl/
├── controllers/          # Route controllers
│   ├── registerController.js
│   ├── proxyJsonController.js
│   └── streamController.js
├── routes/              # Express routes
│   ├── register.js
│   ├── proxyJson.js
│   └── stream.js
├── middlewares/         # Express middlewares
│   ├── errorHandler.js
│   └── validateUrl.js
├── utils/               # Utility functions
│   ├── generateCorexId.js
│   ├── kvStore.js
│   └── mediaHelper.js
├── frontend/            # Static files
│   ├── index.html       # Landing page
│   ├── docs.html        # Documentation
│   └── styles.css
├── docs/                # Markdown documentation
├── server.js            # Main server file
├── vercel.json          # Vercel config
└── package.json
```

---

## Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=23480
NODE_ENV=development
COREX_BASE=https://corexanthony.vercel.app/corex
```

### vercel.json

Pre-configured for Vercel deployment:

```json
{
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Auto-deploys on push

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 23480
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t corex-server .
docker run -p 23480:23480 corex-server
```

### Self-Hosted

```bash
npm install
npm start
```

For production, use a process manager like PM2:

```bash
pm2 start server.js --name "corex-server"
```

---

## Storage Options

### In-Memory (Default)

Suitable for development:

```javascript
const kvStore = {};
```

### Vercel KV (Recommended for Vercel)

```javascript
import { kv } from '@vercel/kv';

await kv.set(corexId, originalUrl);
const url = await kv.get(corexId);
```

### Redis (Self-Hosted)

```javascript
import redis from 'redis';

const client = redis.createClient();
await client.set(corexId, originalUrl);
const url = await client.get(corexId);
```

---

## Security Considerations

- Always use HTTPS in production
- Validate all incoming URLs
- Implement rate limiting
- Consider authentication for registration
- Store sensitive data securely
- Use environment variables for secrets

---

## API Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (missing/invalid data) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Testing

Test endpoints with included examples or curl:

```bash
# Test single URL masking
curl -X POST http://localhost:23480/corex/register \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/video.mp4"}'

# Test JSON proxying
curl -X POST http://localhost:23480/corex/proxy-json \
  -H "Content-Type: application/json" \
  -d '{"json":{"url":"https://example.com/image.jpg"}}'
```

---

## Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch
3. Submit pull request

---

## License

MIT License - See [LICENSE](../LICENSE) for details

---

## Author

**Corex24** - [@Corex24](https://github.com/Corex24)

---

## Acknowledgments

Built with care for secure content delivery.

<div align="center">
  <p><strong>Use with the <a href="https://github.com/Corex24/Corex">Corex client library</a></strong></p>
</div>
