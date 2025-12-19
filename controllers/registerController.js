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
  // Remove query params and fragments first
  const cleanUrl = url.split(/[?#]/)[0];
  if (!cleanUrl.includes(".")) return "";
  const dotIndex = cleanUrl.lastIndexOf(".");
  return cleanUrl.substring(dotIndex);
}

/**
 * Register a single media URL
 * @route POST /corex/register
 * @param {Object} req - Express request object
 * @param {string} req.body.url - Original URL to mask
 * @returns {Object} Success response with masked Corex URL
 */
exports.registerUrl = async (req, res) => {
  try {
    const { url } = req.body;

    // Generate unique Corex ID and store mapping
    const corexId = generateCorexId();
    const extension = getFileExtension(url);
    await storeUrl(corexId, url);

    // Construct masked Corex URL with original extension
    // Use the request's host to support both localhost and production
    const baseUrl = `${req.protocol}://${req.get("host")}/corex`;
    const corexUrl = `${baseUrl}/${corexId}${extension}`;

    return res.status(200).json({
      success: true,
      corexId,
      corexUrl,
      message: "URL successfully masked"
    });
  } catch (error) {
    console.error("URL registration error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register URL. Please try again later."
    });
  }
};
