const { v4: uuidv4 } = require("uuid");
const { storeUrl } = require("../utils/kvStore");

/**
 * Generate a unique Corex ID
 * Format: cx_<22-char-uuid>
 * @returns {string} Unique Corex ID
 */
function generateCorexId() {
  return "cx_" + uuidv4().replace(/-/g, "");
}

/**
 * Extract file extension from URL
 * @param {string} url - URL to extract extension from
 * @returns {string} File extension including dot, or empty string
 */
function getFileExtension(url) {
  const lowerUrl = url.toLowerCase();
  
  // 1. Aggressive Extraction: Find the last dot followed by 2-5 alphanumeric chars
  // This looks at the path part primarily to avoid query param noise
  const pathPart = lowerUrl.split(/[?#]/)[0];
  const lastDot = pathPart.lastIndexOf(".");
  if (lastDot !== -1) {
    const ext = pathPart.substring(lastDot);
    // Basic safety: avoid TLDs or long strings
    if (ext.length >= 3 && ext.length <= 6 && /^\.[a-z0-9]+$/i.test(ext)) {
      return ext;
    }
  }

  // 2. Fallback: Search the ENTIRE URL for common media extension markers
  const commonExtensions = [".mp4", ".mp3", ".srt", ".vtt", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".ts", ".m3u8"];
  for (const ext of commonExtensions) {
    if (lowerUrl.includes(ext)) return ext;
  }

  // 3. Fallback: Check mime_type in query parameters
  if (lowerUrl.includes("mime_type=video")) return ".mp4";
  if (lowerUrl.includes("mime_type=audio")) return ".mp3";
  if (lowerUrl.includes("mime_type=image")) return ".jpg";

  // 4. Generic keyword mapping
  if (lowerUrl.includes("/video/") || lowerUrl.includes("/resource/")) return ".mp4";
  if (lowerUrl.includes("/audio/")) return ".mp3";
  if (lowerUrl.includes("/subtitle/")) return ".srt";

  return "";
}

/**
 * Check if a string is a valid HTTP(S) URL with a media file extension
 * Only masks URLs that end with common media file extensions (before query params)
 * @param {string} value - String to validate
 * @returns {boolean} True if valid HTTP(S) URL with media extension
 */
function isValidUrl(value) {
  if (typeof value !== "string" || !/^https?:\/\/\S+$/i.test(value)) {
    return false;
  }

  // Ultra-comprehensive list of supported formats
  const mediaExtensions = [
    // Video
    ".mp4", ".avi", ".mov", ".mkv", ".flv", ".wmv", ".webm", ".m3u8", ".ts", ".m4v", ".mpg", ".mpeg", ".vob", ".3gp", ".3g2", ".m2ts", ".divx",
    // Audio
    ".mp3", ".wav", ".aac", ".flac", ".m4a", ".ogg", ".wma", ".mid", ".midi", ".mpc", ".opus", ".m4p", ".m4b",
    // Images
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".ico", ".tiff", ".tif", ".heic", ".heif", ".avif",
    // Documents
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf", ".odt", ".ods", ".odp", ".csv",
    // Archives & Misc
    ".zip", ".rar", ".7z", ".tar", ".gz", ".iso", ".dmg", ".bin", ".pkg", ".apk", ".exe",
    // Subtitles
    ".srt", ".vtt", ".ass", ".sub"
  ];

  // 1. Check if the URL has a file-like extension in the path
  const pathPart = lowerValue.split(/[?#]/)[0];
  const lastSegment = pathPart.split('/').pop();
  
  if (lastSegment.includes('.')) {
    const ext = lastSegment.substring(lastSegment.lastIndexOf('.')).toLowerCase();
    // Exclude common web page extensions to avoid masking API endpoints or web pages
    const webExtensions = [".html", ".htm", ".php", ".aspx", ".jsp", ".js", ".css", ".json"];
    if (!webExtensions.includes(ext) && ext.length >= 3 && ext.length <= 6) {
      return true;
    }
  }

  // 2. Check for any part of the URL containing common media extensions (even in params)
  const commonMedia = [".mp4", ".mp3", ".mkv", ".avi", ".mov", ".srt", ".vtt", ".ts", ".m3u8", ".webp", ".jpg", ".png"];
  if (commonMedia.some(ext => lowerValue.includes(ext))) {
    return true;
  }

  // 3. Fallback: Search for mime_type or generic media keywords
  if (lowerValue.includes("mime_type=") || 
      ["/video/", "/audio/", "/media/", "/storage/", "/resource/", "/source/", "cdn", "cloudfront"]
      .some(k => lowerValue.includes(k))) {
    return true;
  }

  return false;
}

/**
 * Recursively traverse and mask all URLs in a JSON object or array
 * @param {any} value - JSON value to process (can be string, object, array, or primitive)
 * @param {string} baseUrl - Base URL for masked URLs (e.g., http://localhost:23480/corex)
 * @returns {any} Value with all URLs masked
 */
function wrapJson(value, baseUrl) {
  // Detect and mask URLs
  if (isValidUrl(value)) {
    const corexId = generateCorexId();
    const extension = getFileExtension(value);
    storeUrl(corexId, value);
    return `${baseUrl}/${corexId}${extension}`;
  }

  // Process arrays recursively
  if (Array.isArray(value)) {
    return value.map((item) => wrapJson(item, baseUrl));
  }

  // Process objects recursively
  if (typeof value === "object" && value !== null) {
    const wrapped = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        wrapped[key] = wrapJson(value[key], baseUrl);
      }
    }
    return wrapped;
  }

  // Return primitives unchanged
  return value;
}

/**
 * Proxy a JSON object and mask all URLs within it
 * @route POST /corex/proxy-json
 * @param {Object} req - Express request object
 * @param {Object} req.body.json - JSON object to proxy
 * @returns {Object} Response with wrapped JSON
 */
exports.wrapJsonApi = async (req, res) => {
  try {
    const { json } = req.body;

    // Validate JSON input
    if (!json || typeof json !== "object") {
      return res.status(400).json({
        error: "Invalid or missing JSON",
        details: "Please provide a valid JSON object in the request body"
      });
    }

    // Use the request's host to support both localhost and production
    const baseUrl = `${req.protocol}://${req.get("host")}/corex`;

    // Mask all URLs in the JSON
    const wrappedJson = wrapJson(json, baseUrl);

    return res.status(200).json({
      success: true,
      wrappedJson,
      message: "All URLs successfully masked"
    });
  } catch (error) {
    console.error("JSON proxy error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to proxy JSON. Please try again later."
    });
  }
};
