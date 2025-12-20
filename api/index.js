try {
  const app = require("../server");
  module.exports = app;
} catch (error) {
  console.error("Vercel Startup Error:", error);
  // Re-throw so Vercel knows it failed
  throw error;
}
