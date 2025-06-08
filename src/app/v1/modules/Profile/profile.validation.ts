import { z } from 'zod';
import { GENDER, ISO_DATE_REGEX } from './profile.constant';

const urlOrEmpty = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: 'Must be a valid URL or empty',
  });
const socialAccountsSchema = z.object({
  tiktok: urlOrEmpty,
  facebook: urlOrEmpty,
  instagram: urlOrEmpty,
  linkedin: urlOrEmpty,
});

// Profile update schema
const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'Full name must be at least 3 characters' })
    .max(40, { message: 'Full name must be at most 40 characters' })
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces.')
    .optional(),

  bio: z
    .string()
    .trim()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),

  birthDate: z
    .string()
    .optional()
    .refine((val) => !val || ISO_DATE_REGEX.test(val), {
      message: 'Date must be in YYYY-MM-DD format',
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date value',
    })
    .transform((val) => (val ? new Date(val) : undefined)), // Now it's a Date object

  location: z.string().trim().optional(),

  website: z
    .string()
    .trim()
    .url({
      message: 'Website must be a valid URL',
    })
    .optional(),

  socialAccounts: socialAccountsSchema.optional(),

  gender: z
    .enum([GENDER.FEMALE, GENDER.MALE], {
      invalid_type_error: `Gender must be ${Object.values(GENDER).join(' or ')}`,
    })
    .optional(),
});

// Exported validations
export const ProfileValidations = {
  updateProfileSchema,
};
