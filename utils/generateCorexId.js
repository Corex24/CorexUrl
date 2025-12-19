const crypto = require("crypto");

/**
 * Generates a unique Corex ID.
 * Format: cx_<12-16 char url-safe string>
 * Example: cx_ A1B2C3D4a5b6
 */

function generateCorexId() {
  const random = crypto.randomBytes(9).toString("base64url");
  return `cx_${random}`;
}
module.exports = generateCorexId;
