# Code Examples

## Basic Examples

### Example 1: Simple URL Masking
```javascript
const { coverUrl } = require('corex');

// Mask a video URL
const videoUrl = coverUrl('https://cdn.example.com/videos/movie.mp4');
console.log('Masked URL:', videoUrl);
```

### Example 2: Video Player Integration
```javascript
const express = require('express');
const { coverUrl } = require('corex');

const app = express();

app.get('/watch/:videoId', (req, res) => {
  const originalUrl = getVideoUrlFromDB(req.params.videoId);
  const maskedUrl = coverUrl(originalUrl);
  
  res.json({
    title: 'My Video',
    player: {
      src: maskedUrl,
      type: 'video/mp4'
    }
  });
});
```

---

## API Examples

### Example 3: Proxy JSON API Response
```javascript
const express = require('express');
const app = express();

app.get('/api/data', async (req, res) => {
  try {
    // Fetch from external API
    const response = await fetch('https://api.example.com/content');
    const data = await response.json();
    
    // Mask all URLs in the response
    const maskedData = await proxyJsonData(data);
    res.json(maskedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function proxyJsonData(json) {
  // This would call /corex/proxy-json endpoint
  const response = await fetch('http://localhost:23480/corex/proxy-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json })
  });
  
  return response.json();
}
```

### Example 4: Protected Image Gallery
```javascript
const { coverUrl } = require('corex');

async function getGallery(userId) {
  const images = [
    'https://storage.example.com/user1/photo1.jpg',
    'https://storage.example.com/user1/photo2.jpg',
    'https://storage.example.com/user1/photo3.jpg'
  ];
  
  return images.map(image => ({
    original: image,
    masked: coverUrl(image),
    thumbnail: coverUrl(image + '?size=thumb')
  }));
}
```

---

## Advanced Examples

### Example 5: Stream Media with Authentication
```javascript
const express = require('express');
const app = express();

app.get('/secure-stream/:mediaId', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const media = getMediaFromDB(req.params.mediaId);
    
    // Check permissions
    if (media.ownerId !== user.id && !user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Log access for analytics
    logAccess(user.id, media.id);
    
    // Redirect to masked URL
    res.redirect(media.maskedUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
```

### Example 6: Batch URL Masking
```javascript
const { coverUrl } = require('corex');

async function maskMultipleUrls(urls) {
  const batchRequests = urls.map(url => 
    fetch('http://localhost:23480/corex/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
  );
  
  const responses = await Promise.all(batchRequests);
  const maskedUrls = await Promise.all(
    responses.map(res => res.json())
  );
  
  return maskedUrls.map(item => item.corexUrl);
}

// Usage
const urls = [
  'https://example.com/video1.mp4',
  'https://example.com/video2.mp4',
  'https://example.com/video3.mp4'
];

const masked = await maskMultipleUrls(urls);
```

### Example 7: Streaming Server with Caching
```javascript
const express = require('express');
const NodeCache = require('node-cache');
const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

app.get('/corex/:id', async (req, res) => {
  const { id } = req.params;
  
  // Check cache first
  const cached = cache.get(id);
  if (cached) {
    return res.json({ url: cached });
  }
  
  try {
    // Get from origin
    const stream = await getOriginalStream(id);
    
    // Cache the result
    cache.set(id, stream.url);
    
    res.setHeader('Content-Type', stream.contentType);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Real-World Scenarios

### Scenario 1: Content Platform
```javascript
// Hide storage URLs from users
app.get('/content/:id', (req, res) => {
  const content = {
    id: req.params.id,
    title: 'Amazing Video',
    description: 'A great video',
    video: coverUrl('https://storage.company.com/videos/amazing.mp4'),
    thumbnail: coverUrl('https://storage.company.com/thumbs/amazing.jpg'),
    poster: coverUrl('https://storage.company.com/posters/amazing.jpg')
  };
  
  res.json(content);
});
```

### Scenario 2: API Monetization
```javascript
// Mask URLs in API responses for premium users only
app.get('/api/premium-content', requirePremium, async (req, res) => {
  const content = await fetchContent();
  
  // Only show masked URLs to premium users
  const response = {
    ...content,
    downloadUrl: coverUrl(content.downloadUrl),
    previewUrl: coverUrl(content.previewUrl)
  };
  
  res.json(response);
});
```

### Scenario 3: Multi-tenant System
```javascript
// Each tenant gets masked URLs for their content
async function getTenanantContent(tenantId) {
  const content = await db.content.find({ tenantId });
  
  return content.map(item => ({
    ...item,
    mediaUrl: coverUrl(item.mediaUrl),
    storageUrl: coverUrl(item.storageUrl)
  }));
}
```

---

## Error Handling

### Example 8: Comprehensive Error Handling
```javascript
const express = require('express');
const app = express();

app.post('/api/mask-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate input
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        code: 'MISSING_URL'
      });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        code: 'INVALID_URL'
      });
    }
    
    // Mask the URL
    const response = await fetch('http://localhost:23480/corex/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to mask URL',
      message: error.message
    });
  }
});
```

---

## Testing

### Example 9: Unit Tests
```javascript
const { coverUrl } = require('corex');
const assert = require('assert');

describe('coverUrl', () => {
  it('should mask a valid URL', async () => {
    const url = 'https://example.com/video.mp4';
    const masked = coverUrl(url);
    
    assert(masked.includes('corex'));
    assert(masked.startsWith('https://'));
  });
  
  it('should preserve file extension', async () => {
    const url = 'https://example.com/file.pdf';
    const masked = coverUrl(url);
    
    assert(masked.endsWith('.pdf'));
  });
  
  it('should throw on invalid URL', () => {
    assert.throws(() => {
      coverUrl('not a url');
    });
  });
});
```
