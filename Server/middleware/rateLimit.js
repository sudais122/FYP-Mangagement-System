import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests
  message: {
    message: "Too many requests, please try again later.",
  },
});

// Strict limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 attempts per 15 min
  message: {
    message: "Too many login attempts. Try again later.",
  },
});