import { z } from 'zod';
import { USER_ROLE } from './user.constant';
import { User } from './user.model';

const changeUserRoleSchema = z.object({
  role: z.enum(Object.keys(USER_ROLE) as [string, ...string[]]),
});

const usernameRegex = /^[a-z0-9._]{6,20}$/; // Like Insta: lowercase, numbers, ., _

const usernameSchema = z.object({
  username: z
    .string()
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

export const UserValidations = {
  changeUserRoleSchema,
  usernameSchema,
};
