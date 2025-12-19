# Basic Usage Guide

## Overview
Corex provides three main functions for URL masking and API protection:
1. **coverUrl()** - Mask individual URLs
2. **proxyApi()** - Proxy and mask API responses
3. **Stream** - Stream protected media securely

## URL Masking

### Basic Example
```javascript
const { coverUrl } = require('corex');

// Mask a single URL
const maskedUrl = coverUrl('https://example.com/video.mp4');
console.log(maskedUrl);
// Output: https://corexanthony.vercel.app/corex/cx_xxxxx.mp4
```

### How It Works
1. Your original URL is stored securely
2. A masked URL is generated with a unique Corex ID
3. When accessed, the masked URL retrieves and streams the original content
4. The original URL remains hidden from users

## API Proxy

### Mask API Responses
```javascript
const { proxyApi } = require('corex');

// Proxy API with automatic URL masking
const apiResponse = await proxyApi('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
});

console.log(apiResponse);
// All URLs in the response are automatically masked
```

### Advanced Options
```javascript
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    data: 'your-data'
  })
};

const response = await proxyApi(endpoint, options);
```

## Streaming Media

### Stream Protected Media
```javascript
const { streamMedia } = require('corex');

app.get('/stream/:id', async (req, res) => {
  const { id } = req.params;
  await streamMedia(id, res);
});
```

## Error Handling

```javascript
try {
  const masked = coverUrl('https://example.com/file.mp4');
} catch (error) {
  console.error('Error masking URL:', error.message);
}
```

## Best Practices

✅ **Do:**
- Use Corex for protecting sensitive media
- Cache masked URLs when possible
- Store Corex IDs in your database
- Use environment variables for sensitive data

❌ **Don't:**
- Expose original URLs to clients
- Share Corex IDs publicly
- Store masked URLs permanently
- Use for unauthorized content distribution

## Common Use Cases

### Media Player Integration
```javascript
// Get masked URL for video player
const videoUrl = coverUrl('https://storage.example.com/videos/movie.mp4');
// Pass to player: <video src={videoUrl} />
```

### API Response Protection
```javascript
// Protect multiple URLs in API response
const userData = {
  name: 'John Doe',
  profileImage: coverUrl('https://example.com/avatar.jpg'),
  banner: coverUrl('https://example.com/banner.jpg')
};
```

### Content Delivery
```javascript
// Secure content distribution
const secureCDN = {
  pdf: coverUrl('https://storage.example.com/doc.pdf'),
  image: coverUrl('https://storage.example.com/image.png'),
  video: coverUrl('https://storage.example.com/video.mp4')
};
```

## Troubleshooting

**Issue:** Masked URL returns 404
- Check if the original URL is still accessible
- Verify the Corex ID is correct

**Issue:** CORS errors
- Corex has CORS enabled by default
- Check your client's origin settings

**Issue:** Large files timing out
- Stream endpoint handles large files efficiently
- Check your server timeout settings
