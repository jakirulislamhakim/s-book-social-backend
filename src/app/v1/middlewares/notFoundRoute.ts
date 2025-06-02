import { Request, Response } from 'express';
import httpStatus from 'http-status';

export const notFoundRoute = (req: Request, res: Response) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `Unable to find the requested route ${req.originalUrl} !`,
  });
};
