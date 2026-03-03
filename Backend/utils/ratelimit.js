const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                 // 20 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Try again later."
  }
});
