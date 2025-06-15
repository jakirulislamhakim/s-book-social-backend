import { Types } from 'mongoose';
import { z } from 'zod';

const createPostAppealSchema = z.object({
  postId: z
    .string({
      required_error: 'postId is required',
    })
    .trim()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    }),

  message: z
    .string({
      required_error: 'Appeal message is required',
    })
    .trim()
    .min(10, { message: 'Appeal message must be at least 10 characters long' })
    .max(500, { message: 'Appeal message can not exceed 500 characters' }),
});

const appealAdminResponseSchema = z.object({
  adminResponse: z
    .string()
    .max(500, {
      message: 'Admin response can not exceed 500 characters',
    })
    .optional(),
});

export const PostAppealValidations = {
  createPostAppealSchema,
  appealAdminResponseSchema,
};
