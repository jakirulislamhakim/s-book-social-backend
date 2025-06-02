import winston from 'winston';

// Define log format
const logFormat = winston.format.printf(
  ({ level, message, timestamp, traceId = '' }) => {
    return `[${level}]: timestamp:${timestamp} ${traceId && `traceId:[${traceId}]`} msg:${message}`;
  },
);

export const appLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss A' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    // winston.format.cli(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'src/app/v1/logger/app.log' }),
    new winston.transports.File({
      filename: 'src/app/v1/logger/error.log',
      level: 'error',
    }),
  ],
});
