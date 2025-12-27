// Error Handling Middleware
const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: statusCode === 500 && !isDevelopment 
      ? 'Internal server error' 
      : err.message,
    ...(isDevelopment && { 
      stack: err.stack,
      details: err.details 
    })
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
}

/**
 * Async handler wrapper to catch errors in async routes
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};

