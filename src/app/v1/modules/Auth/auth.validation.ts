import { z } from 'zod';
import { GENDER } from '../Profile/profile.constant';
import { USER_ROLE } from '../User/user.constant';

//  Common Regex Patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

//  Common Validation Rules
const fullNameSchema = z
  .string({ required_error: 'Full name is required' })
  .min(3, { message: 'Full name must be at least 3 characters' })
  .max(40, { message: 'Full name must be at most 40 characters' })
  .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces.');

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email({ message: 'Invalid email format' });

// utils for custom pass error msg
const passwordSchema = (passwordType: string) =>
  z
    .string({ required_error: `${passwordType} is required` })
    .max(20, {
      message: `${passwordType} can't be longer than 20 characters.`,
    })
    .regex(passwordRegex, {
      message: `${passwordType} must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.`,
    });

const identifierSchema = z
  .string({ required_error: 'Username or email is required' })
  .refine((val) => emailRegex.test(val) || usernameRegex.test(val), {
    message: 'Identifier must be a valid email or username',
  });

//  Validation Schemas
const userRegistrationSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  birthDate: z
    .string()
    .refine((val) => isoDateRegex.test(val), {
      message: 'Date must be in YYYY-MM-DD format',
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date value',
    })
    .transform((val) => new Date(val)), // Now it's a Date object
  gender: z.enum(Object.values(GENDER) as [string, ...string[]], {
    required_error: 'Gender is required',
    invalid_type_error: "Gender must be 'male' or 'female'",
  }),
  password: passwordSchema('Password'),
});

const loginSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema('Password'),
});

const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});

const changePasswordSchema = z.object({
  oldPassword: passwordSchema('Old password'),
  newPassword: passwordSchema('New password'),
});

const forgetPasswordSchema = z.object({
  identifier: identifierSchema,
});

const resetPasswordSchema = z.object({
  newPassword: passwordSchema('New password'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});

const changeUserRoleSchema = z.object({
  userId: z
    .string({
      required_error: 'User ID is required',
    })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN], {
    required_error: 'Role is required',
    invalid_type_error: "Role must be 'user' or 'admin'",
  }),
});

//  Exporting Validation Schemas
export const AuthValidations = {
  userRegistrationSchema,
  loginSchema,
  resendVerificationEmailSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  changeUserRoleSchema,
};
