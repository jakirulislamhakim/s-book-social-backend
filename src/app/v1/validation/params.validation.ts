import { Types } from 'mongoose';
import { z } from 'zod';

// regex for query
const allNegativeRegex = /^(-\w+)(,-\w+)*$/;
const allPositiveRegex = /^(\w+)(,\w+)*$/;
const sortRegex = /^-?\w+(?:,-?\w+)*$/;

const queryParamsSchema = z
  .object({
    page: z.coerce
      .number({
        message: 'Page must be a valid integer.',
      })
      .int()
      .min(1, { message: 'Page must be greater than or equal to 1.' })
      .optional(),

    limit: z.coerce
      .number({
        message: 'Limit must be a valid integer.',
      })
      .int()
      .min(1, { message: 'Limit must be greater than or equal to 1.' })
      .max(1000, { message: 'Limit must not exceed 1000.' })
      .optional(),

    searchTerm: z
      .string()
      .trim()
      .max(200, { message: 'Search term should not exceed 200 characters.' })
      .optional(),

    fields: z
      .string()
      .trim()
      .refine(
        (val) => allNegativeRegex.test(val) || allPositiveRegex.test(val),
        {
          message:
            'Fields must be a comma-separated list of valid field names, e.g., "-updatedDate,-image" or "updatedDate,image". All values must either start with "-" or none should.',
        },
      )
      .optional(),

    sort: z
      .string()
      .trim()
      .regex(sortRegex, {
        message:
          'Sort must be a comma-separated list of field names with optional "-" prefix, e.g., "updatedDate,createdAt" or "updatedDate,-createdAt".',
      })
      .optional(),
  })
  .passthrough();

const pathParamObjectIDSchema = (pathParamName = 'id') => {
  return z.object({
    [pathParamName]: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: `Invalid '${pathParamName}': must be a valid Mongo ObjectId`,
    }),
  });
};

export const ParamsValidations = {
  queryParamsSchema,
  pathParamObjectIDSchema,
};
