# API Reference

## REST Endpoints

### POST /corex/register
Register and mask a single URL.

**Request:**
```json
{
  "url": "https://example.com/video.mp4"
}
```

**Response:**
```json
{
  "corexUrl": "https://corexanthony.vercel.app/corex/cx_abc123def456.mp4"
}
```

**Status Codes:**
- `200` - Success
- `400` - No URL provided
- `500` - Server error

---

### POST /corex/proxy-json
Mask all URLs within a JSON object recursively.

**Request:**
```json
{
  "json": {
    "title": "My Video",
    "videoUrl": "https://example.com/video.mp4",
    "thumbnails": [
      "https://example.com/thumb1.jpg",
      "https://example.com/thumb2.jpg"
    ]
  }
}
```

**Response:**
```json
{
  "wrappedJson": {
    "title": "My Video",
    "videoUrl": "https://corexanthony.vercel.app/corex/cx_xxx1.mp4",
    "thumbnails": [
      "https://corexanthony.vercel.app/corex/cx_xxx2.jpg",
      "https://corexanthony.vercel.app/corex/cx_xxx3.jpg"
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - No JSON provided
- `500` - Server error

---

### GET /corex/:id
Stream the original media for a masked URL.

**Parameters:**
- `id` (required) - Corex ID (e.g., `cx_abc123def456`)

**Response:**
- Streams the original media file
- Sets appropriate `Content-Type` header
- Handles all file types (video, audio, image, etc.)

**Status Codes:**
- `200` - Success, streaming content
- `404` - Corex ID not found
- `500` - Error fetching original media

**Headers:**
```
Content-Type: (based on original file)
Content-Length: (file size)
Cache-Control: public, max-age=3600
```

---

## JavaScript SDK Functions

### coverUrl(url)
Masks a single URL locally or via API.

```javascript
const maskedUrl = coverUrl('https://example.com/file.mp4');
```

**Parameters:**
- `url` (string) - The URL to mask

**Returns:**
- `string` - The masked URL

**Throws:**
- Error if URL is invalid

---

### proxyApi(endpoint, options)
Proxies an API request and masks all URLs in the response.

```javascript
const response = await proxyApi(endpoint, {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' }
});
```

**Parameters:**
- `endpoint` (string) - The API endpoint
- `options` (object) - Fetch options
  - `method` - HTTP method (GET, POST, etc.)
  - `headers` - Request headers
  - `body` - Request body

**Returns:**
- `object` - Response with masked URLs

**Throws:**
- Error if request fails

---

### streamMedia(id, response)
Streams the original media to a response object.

```javascript
app.get('/stream/:id', async (req, res) => {
  await streamMedia(req.params.id, res);
});
```

**Parameters:**
- `id` (string) - Corex ID
- `response` (object) - Express response object

**Throws:**
- Error if ID not found

---

## Error Responses

### Invalid URL
```json
{
  "error": "No URL provided"
}
```

### URL Not Found
```json
{
  "error": "Corex ID not found"
}
```

### Server Error
```json
{
  "error": "Error fetching original media"
}
```

---

## Rate Limiting

The API currently has no rate limiting, but we recommend implementing:
- Per-IP rate limiting: 1000 requests/hour
- Per-endpoint rate limiting: 100 requests/minute

---

## CORS Policy

All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Example Requests

### cURL
```bash
# Register URL
curl -X POST http://localhost:23480/corex/register \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/video.mp4"}'

# Proxy JSON
curl -X POST http://localhost:23480/corex/proxy-json \
  -H "Content-Type: application/json" \
  -d '{"json":{"video":"https://example.com/video.mp4"}}'
```

### JavaScript Fetch
```javascript
// Register URL
const response = await fetch('http://localhost:23480/corex/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com/video.mp4' })
});

const data = await response.json();
console.log(data.corexUrl);
```

### Python Requests
```python
import requests

# Register URL
response = requests.post('http://localhost:23480/corex/register',
  json={'url': 'https://example.com/video.mp4'}
)

print(response.json()['corexUrl'])
```
