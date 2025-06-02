import { RequestHandler } from 'express';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

/**
 * Middleware to parse `multipart/form-data` requests where the JSON payload
 * is sent inside a `data` field.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 * @throws {AppError} Throws an error if `data` field is missing in the request body.
 *
 * @example
 * // Using with Multer to handle file uploads and JSON data
 * import multer from 'multer';
 * const upload = multer();
 *
 * app.post(
 *   '/upload',
 *   upload.image(), // Accepts form-data but without files
 *   parseFormDataToJSONMiddleware,
 *   (req, res) => {
 *     res.json({ message: 'Form data parsed successfully', data: req.body });
 *   }
 * );
 */

export const parseFormDataToJSONMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
    next();
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'data field is required in Form data !',
    );
  }
};
