import { Types } from 'mongoose';
import { z } from 'zod';

const createCommentSchema = z.object({
  postId: z
    .string({
      required_error: 'postId is required',
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    }),

  content: z
    .string({
      required_error: 'Comment content is required',
    })
    .trim()
    .max(1000, 'Content too long'),

  parentId: z
    .string()
    .refine((val) => val === undefined || Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    })
    .optional(),
});

const updateCommentSchema = createCommentSchema.pick({
  content: true,
});

export const CommentValidation = {
  createCommentSchema,
  updateCommentSchema,
};
