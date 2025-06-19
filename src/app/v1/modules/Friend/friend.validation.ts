import { Types } from 'mongoose';
import { z } from 'zod';

const createFriendshipSchema = z.object({
  receiverId: z
    .string({
      required_error: 'Receiver ID is required',
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    }),
});

const paginationQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .refine((val) => /^\d+$/.test(val), {
      message: 'Page must be a positive integer',
    })
    .transform(Number)
    .refine((val) => val > 0, {
      message: 'Page must be greater than 0',
    }),

  limit: z
    .string()
    .default('20')
    .refine((val) => /^\d+$/.test(val), {
      message: 'Limit must be a positive integer',
    })
    .transform(Number)
    .refine((val) => val > 0 && val <= 1000, {
      message: 'Limit must be between 1 and 1000',
    }),

  sort: z
    .string()
    .default('-1')
    .refine((val) => val === '1' || val === '-1', {
      message: "Sort must be '1'(asc) or '-1'(desc)",
    })
    .transform((val) => parseInt(val) as 1 | -1),
});

export const FriendshipValidations = {
  createFriendshipSchema,
  paginationQuerySchema,
};
