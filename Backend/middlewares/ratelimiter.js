
const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = rateLimiter;
