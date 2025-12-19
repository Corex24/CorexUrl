/**
 * URL Validation Middleware
 * Validates that request contains a properly formatted HTTP(S) URL
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if valid, returns error response if not
 */
function validateUrl(req, res, next) {
  const { url } = req.body || {};

  // Check URL presence and type
  if (!url || typeof url !== "string") {
    return res.status(400).json({
      error: "Invalid Request",
      details: "A valid URL string is required in the request body"
    });
  }

  try {
    // Parse and validate URL
    const parsed = new URL(url);

    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({
        error: "Invalid Protocol",
        details: "Only HTTP and HTTPS protocols are supported",
        provided: parsed.protocol
      });
    }

    // URL is valid, proceed to next middleware
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Invalid URL Format",
      details: "Please provide a valid HTTP(S) URL",
      message: err.message
    });
  }
}

module.exports = validateUrl;
