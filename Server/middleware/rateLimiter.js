import rateLimit from "express-rate-limit";

// ── Global — applies to every route
export const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,   // 15 min
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Too many requests. Please wait a moment and try again.",
  },
});

// ── Login — strict
export const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,   // 15 min
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: true,    
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
});

// ── Registration — very strict
export const registerLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,   // 1 hour
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 1 hour.",
  },
});

// ── Proposal upload
export const proposalUploadLimiter = rateLimit({
  windowMs:         10 * 60 * 1000,   // 10 min
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Too many proposal uploads. Please wait 10 minutes before trying again.",
  },
});

// ── Admin actions
export const adminLimiter = rateLimit({
  windowMs:         60 * 1000,         // 1 min
  max:              30,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Too many admin requests. Please slow down.",
  },
});

// ── Password reset / OTP
export const forgotPasswordLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,   // 15 min
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    message: "Too many password reset requests. Please wait 15 minutes.",
  },
});