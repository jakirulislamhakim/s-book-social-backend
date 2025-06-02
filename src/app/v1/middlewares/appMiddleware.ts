import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import express, { Application } from 'express';
import { traceId } from './traceId';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { limiterMiddleware } from './limiter';
import config from '../config';

export const appMiddleware = (app: Application) => {
  app.use(compression()); // reducing response size
  app.use(express.json()); // parsed body json data
  app.use(express.urlencoded({ extended: true })); // for parse application/x-www-form-urlencoded data
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['POST', 'GET', 'PATCH', 'DELETE', 'PUT'],
    }),
  );
  app.use(cookieParser()); // parse cookie
  app.use(limiterMiddleware); // rat limiting
  app.use(traceId); // adjudge trace id in res headers and req
  app.use(helmet()); // add security headers
  app.use(
    ExpressMongoSanitize({
      allowDots: true,
    }),
  ); // for prevent npsql injection
};
