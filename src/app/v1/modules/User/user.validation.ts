import { z } from 'zod';
import { User } from './user.model';

const usernameRegex = /^[a-z0-9._]{6,20}$/; // Like Instra: lowercase, numbers, ., _

const usernameSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(6, 'Username must be at least 6 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      usernameRegex,
      'Only lowercase letters, numbers, underscores, or dots allowed',
    )
    .refine(async (username) => !(await User.exists({ username })), {
      message: 'Username already taken',
    }),
});

const suspendUserSchema = z.object({
  suspensionReason: z
    .string({
      required_error: 'Suspension reason is required',
    })
    .max(500, 'Suspension reason should not exceed 500 characters'),
});

export const UserValidations = {
  usernameSchema,
  suspendUserSchema,
};
