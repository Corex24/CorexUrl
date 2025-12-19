/**
 * Global Error Handling Middleware
 * Processes unhandled errors and sends consistent error responses
 * IMPORTANT: Must be registered LAST in the Express app
 */

function errorHandler(err, req, res, next) {
  // Log error on server
  console.error("[CorexUrl Error]:", err);

  // Prevent "headers already sent" error
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code (default to 500 for unhandled errors)
  const status = err.status || 500;

  // Send error response with environment-appropriate message
  res.status(status).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
