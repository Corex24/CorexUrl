const fetch = require("node-fetch");
const { getUrl } = require("../utils/kvStore");

/**
 * Extract Corex ID from URL parameter (remove file extension if present)
 * Example: cx_abc123def456.mp4 -> cx_abc123def456
 * @param {string} id - URL parameter with optional extension
 * @returns {string} Clean Corex ID
 */
function getCorexIdFromParam(id) {
  const dotIndex = id.indexOf(".");
  return dotIndex !== -1 ? id.substring(0, dotIndex) : id;
}

/**
 * Stream media content for a masked Corex URL
 * @route GET /corex/:id
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Corex ID with optional extension
 * @returns {Stream} Streams the original media content
 */
exports.streamMedia = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract Corex ID (remove extension if present)
    const corexId = getCorexIdFromParam(id);

    // Retrieve original URL from KV store
    // Retrieve original URL from KV store
    let finalUrl = await getUrl(corexId);
    if (!finalUrl) {
      return res.status(404).json({
        error: "Not Found",
        message: "Corex resource not found",
        corexId
      });
    }

    // Append current request's query parameters to the original URL
    // This allows passing through tokens/signatures (e.g. ?sign=...)
    const originalErrors = new URL(finalUrl);
    for (const [key, value] of Object.entries(req.query)) {
      originalErrors.searchParams.append(key, value);
    }
    finalUrl = originalErrors.toString();

    // Prepare headers for upstream request
    // Preserve Range header for video/audio seeking support
    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    // Fetch original media from upstream
    const upstreamResponse = await fetch(finalUrl, { headers });
    if (!upstreamResponse.ok) {
      return res.status(502).json({
        error: "Bad Gateway",
        message: "Failed to fetch upstream resource"
      });
    }

    // Copy content-related headers from upstream
    const contentType = upstreamResponse.headers.get("content-type");
    const contentLength = upstreamResponse.headers.get("content-length");
    const acceptRanges = upstreamResponse.headers.get("accept-ranges");
    const contentRange = upstreamResponse.headers.get("content-range");
    const contentDisposition = upstreamResponse.headers.get("content-disposition");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    if (acceptRanges) {
      res.setHeader("Accept-Ranges", acceptRanges);
    }
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }

    // Handle partial content (206) for range requests
    if (contentRange) {
      res.status(206);
      res.setHeader("Content-Range", contentRange);
    }

    // Security & Playback headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    // Stream original media to client
    upstreamResponse.body.pipe(res);
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to stream media. Please try again later."
    });
  }
};
