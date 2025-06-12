import { z } from 'zod';
import { Types } from 'mongoose';
import { POST_AUDIENCE } from './post.constant';

// Helper to validate MongoDB ObjectId
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid user ObjectId in posts tags',
});

const createPostSchema = z.object({
  content: z
    .string()
    .max(500, {
      message: 'Content must not exceed 500 characters',
    })
    .optional(),

  tags: z
    .array(objectIdSchema)
    .max(10, {
      message: 'Maximum of 10 user tags are allowed',
    })
    .optional(),

  audience: z
    .enum(
      [POST_AUDIENCE.PUBLIC, POST_AUDIENCE.FRIENDS, POST_AUDIENCE.PRIVATE],
      {
        invalid_type_error: `Post visibility must be ${Object.values(POST_AUDIENCE).join(' or ')}`,
      },
    )
    .optional(),

  location: z.string().optional(),
});

export const PostValidations = {
  createPostSchema,
};
