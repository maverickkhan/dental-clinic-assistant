import rateLimit from 'express-rate-limit';
import { CONFIG } from '@dental-clinic/shared';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_AUTH_MAX,
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat endpoints rate limiter
export const chatLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
  max: CONFIG.RATE_LIMIT_CHAT_MAX,
  message: {
    success: false,
    error: 'Too many chat requests',
    message: 'Too many chat messages, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
