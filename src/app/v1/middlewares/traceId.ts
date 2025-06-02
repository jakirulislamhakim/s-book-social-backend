import { RequestHandler } from 'express';
import crypto from 'crypto';
import { appLogger } from '../logger';

export const traceId: RequestHandler = (req, res, next) => {
  const traceId = crypto.randomUUID();
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);

  // logged every req with traceId
  appLogger.info(`Incoming request: ${req.method} ${req.url}`, { traceId });

  next();
};
