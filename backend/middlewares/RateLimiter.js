const setRateLimit = require("express-rate-limit");

const rateLimitMiddleware = setRateLimit({
  windowMs: 10000,
  max: 12,
  message: { message: "Stop spamming brooo!!" },
  headers: true,
});

module.exports = rateLimitMiddleware;
