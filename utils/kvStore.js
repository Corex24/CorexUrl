/**
 * KV Store Manager
 * Uses Upstash Redis in production, in-memory for development
 */

let redis = null;

// Try to initialize Upstash Redis if credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = require("@upstash/redis");
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn("Upstash Redis not available, using in-memory store");
  }
}

// Fallback in-memory store for development
const memoryStore = {};

/**
 * Store a URL mapping in KV store
 * Creates a permanent mapping: corexId -> originalUrl
 * @param {string} corexId - The masked Corex ID
 * @param {string} originalUrl - The original URL to store
 * @throws {Error} If store operation fails
 */
async function storeUrl(corexId, originalUrl) {
  if (!corexId || !originalUrl) {
    console.warn("Invalid parameters for storeUrl", { corexId, originalUrl });
    return;
  }
  try {
    if (redis) {
      await redis.set(corexId, originalUrl);
    } else {
      memoryStore[corexId] = originalUrl;
    }
  } catch (error) {
    console.error("Failed to store URL:", error);
    throw error;
  }
}

/**
 * Retrieve original URL from KV store using Corex ID
 * @param {string} corexId - The Corex ID to look up
 * @returns {Promise<string|null>} Original URL or null if not found
 */
async function getUrl(corexId) {
  if (!corexId) return null;
  try {
    if (redis) {
      return await redis.get(corexId);
    } else {
      return memoryStore[corexId] || null;
    }
  } catch (error) {
    console.error("Failed to retrieve URL:", error);
    throw error;
  }
}

module.exports = {
  storeUrl,
  getUrl,
};
