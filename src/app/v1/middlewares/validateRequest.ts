import { AnyZodObject, z } from 'zod';
import catchAsync from '../utils/catchAsync';
import { zodWithInputSanitize } from '../utils/zodWithInputSanitize';

const validateRequest = (
  zodSchema: AnyZodObject | z.ZodEffects<AnyZodObject>,
  key: 'body' | 'cookies' | 'query' | 'params',
) =>
  catchAsync(async (req, res, next) => {
    const parsedData = await zodSchema.parseAsync(req[key]);
    req[key] = parsedData;
    next();
  });

/**
 * Middleware to validate `req.body` against a sanitized Zod schema.
 *
 * @param {AnyZodObject} zodSchema - The Zod schema for request body validation.
 * @returns {Function} Express middleware that validates `req.body`.
 *
 *  * @example
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * app.post('/register', validateReq.body(userSchema), (req, res) => {
 *   res.json({ message: 'User registered', data: req.body });
 * });
 */
const validateReqBody = (
  zodSchema: AnyZodObject | z.ZodEffects<AnyZodObject>,
) => validateRequest(zodWithInputSanitize(zodSchema), 'body');
/**
 * Middleware to validate `req.query` against a Zod schema.
 *
 * @param {AnyZodObject} zodSchema - The Zod schema for query parameters validation.
 * @returns {Function} Express middleware that validates `req.query`.
 *
 *  * @example
 * const querySchema = z.object({
 *   page: z.string().transform(Number).optional(),
 *   size: z.string().transform(Number).optional(),
 * });
 *
 * app.get('/products', validateReq.query(querySchema), (req, res) => {
 *   res.json({ message: 'Query validated', query: req.query });
 * });
 */
const validateReqQuery = (zodSchema: AnyZodObject) =>
  validateRequest(zodSchema, 'query');

/**
 * Middleware to validate `req.query` against a Zod schema.
 *
 * @param {AnyZodObject} zodSchema - The Zod schema for query parameters validation.
 * @returns {Function} Express middleware that validates `req.query`.
 *
 *  * @example
 * const querySchema = z.object({
 *   page: z.string().transform(Number).optional(),
 *   size: z.string().transform(Number).optional(),
 * });
 *
 * app.get('/products', validateReq.query(querySchema), (req, res) => {
 *   res.json({ message: 'Query validated', query: req.query });
 * });
 */
const validateReqParams = (zodSchema: AnyZodObject) =>
  validateRequest(zodSchema, 'params');

/**
 * Middleware to validate `req.cookies` against a Zod schema.
 *
 * @param {AnyZodObject} zodSchema - The Zod schema for cookie validation.
 * @returns {Function} Express middleware that validates `req.cookies`.
 *  * @example
 * const refreshTokenSchema = z.object({
 *   refreshToken: z.string(),
 * });
 *
 * app.get('/refreshToken', validateReq.cookies(refreshTokenSchema), (req, res) => {
 *   ... service logic
 * });
 */
const validateReqCookies = (zodSchema: AnyZodObject) =>
  validateRequest(zodSchema, 'cookies');

/**
 * Object containing middleware functions for validating different parts of an Express request
 * (`req.body`, `req.query`, and `req.cookies`) using Zod schemas.
 *
 * @namespace validateReq
 * @property {Function} body - Middleware to validate `req.body` using a Zod schema with input sanitize.
 * @property {Function} query - Middleware to validate `req.query` using a Zod schema.
 * @property {Function} cookies - Middleware to validate `req.cookies` using a Zod schema.
 *
 * @example
 * import { validateReq } from './middlewares';
 * import { z } from 'zod';
 *
 * // Define Zod schema for request body validation
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * app.post('/register', validateReq.body(userSchema), (req, res) => {
 *   res.json({ message: 'User registered', data: req.body });
 * });
 *
 * @example
 * // Define Zod schema for query parameters validation
 * const querySchema = z.object({
 *   page: z.string().transform(Number).optional(),
 *   size: z.string().transform(Number).optional(),
 * });
 *
 * app.get('/products', validateReq.query(querySchema), (req, res) => {
 *   res.json({ message: 'Query validated', query: req.query });
 * });
 *
 * @example
 * // Define Zod schema for cookies validation
 * const refreshTokenSchema = z.object({
 *   refreshToken: z.string(),
 * });
 *
 * app.get('/refreshToken', validateReq.cookies(refreshTokenSchema), (req, res) => {
 *   // Service logic for refreshing token
 * });
 */
export const validateReq = {
  body: validateReqBody,
  queryParams: validateReqQuery,
  cookies: validateReqCookies,
  pathParams: validateReqParams,
};
