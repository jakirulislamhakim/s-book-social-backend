import rateLimit from 'express-rate-limit';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import config from '../config';

export const limiterMiddleware = rateLimit({
  windowMs: (parseInt(config.RATE_LIMIT_WINDOW_MIN) || 5) * 60 * 1000, // default 5 minutes
  max: parseInt(config.RATE_LIMIT_MAX_REQUESTS) || 50, // default 50 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const error = new AppError(
      httpStatus.TOO_MANY_REQUESTS,
      'Too many requests from this IP, please try again after 5 minutes.',
    );
    next(error);
  },
});
