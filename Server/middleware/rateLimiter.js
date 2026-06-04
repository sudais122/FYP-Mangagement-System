import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

// ── Skip all limits during tests ──
const skipInTest = () => isTest;

// ── Global — applies to every route ──
export const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            skipInTest,
  message: {
    success: false,
    message: "Too many requests. Please wait a moment and try again.",
  },
});

// ── Login — strict ──
export const loginLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    5,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  skip:                   skipInTest,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
});

// ── Registration — very strict ──
export const registerLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            skipInTest,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 1 hour.",
  },
});

// ── Proposal upload ──
export const proposalUploadLimiter = rateLimit({
  windowMs:        10 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            skipInTest,
  message: {
    success: false,
    message: "Too many proposal uploads. Please wait 10 minutes before trying again.",
  },
});

// ── Password reset / OTP ──
export const forgotPasswordLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            skipInTest,
  message: {
    success: false,
    message: "Too many password reset requests. Please wait 15 minutes.",
  },
});