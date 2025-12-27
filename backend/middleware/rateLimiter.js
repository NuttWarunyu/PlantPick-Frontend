// Rate Limiting Middleware
const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * AI endpoints rate limiter
 * 10 requests per minute per IP (more restrictive due to cost)
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin endpoints rate limiter
 * 1000 requests per 15 minutes per IP (more lenient for admin)
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Scraping endpoints rate limiter
 * 5 requests per minute per IP (very restrictive due to resource usage)
 */
const scrapingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: {
    success: false,
    message: 'Too many scraping requests. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  aiLimiter,
  adminLimiter,
  scrapingLimiter
};

