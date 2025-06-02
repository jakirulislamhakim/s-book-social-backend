import { ErrorRequestHandler, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { TErrorSources } from '../interface/errorInterface';
import config from '../config';
import handleZodError from '../errors/handleZodError';
import handleMongooseValidationError from '../errors/handleMongooseValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import AppError from '../errors/AppError';
import { appLogger } from '../logger';

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  // setting default values
  let statusCode: number = err.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR;
  let message: string =
    err.message ?? 'An unexpected error occurred. Please try again later.';

  // default errorSource value
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong !',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err.name === 'ValidationError') {
    const simplifiedError = handleMongooseValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  // logged error
  appLogger.error(` method: ${req.method}: ${req.url} msg: ${message}`, {
    traceId: req.traceId,
    error: err,
  });

  // ultimate response
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // err, //! only for development purpose
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};
