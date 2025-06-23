import { Types } from 'mongoose';
import { z } from 'zod';
import { REACTION_TARGET_TYPE, REACTION_TYPE } from './reaction.constant';

const typeSchema = z
  .enum(
    [
      REACTION_TYPE.LOVE,
      REACTION_TYPE.HAHA,
      REACTION_TYPE.SAD,
      REACTION_TYPE.CARE,
      REACTION_TYPE.DOG,
      REACTION_TYPE.FALTU,
      REACTION_TYPE.DONG,
      REACTION_TYPE.SHOE,
    ],
    {
      errorMap: () => ({
        message: `Reaction type must be one of: ${Object.values(
          REACTION_TYPE,
        ).join(', ')}`,
      }),
    },
  )
  .optional();

const createReactionSchema = z.object({
  targetType: z.enum(
    [
      REACTION_TARGET_TYPE.POST,
      REACTION_TARGET_TYPE.COMMENT,
      REACTION_TARGET_TYPE.STORY,
    ],
    {
      errorMap: () => ({
        message: `Target type must be one of: ${Object.values(
          REACTION_TARGET_TYPE,
        ).join(', ')}`,
      }),
    },
  ),

  targetId: z
    .string({
      required_error: 'Target ID is required',
      invalid_type_error: 'Target ID must be a string',
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    }),

  type: typeSchema,
});

const getReactionQuerySchema = z.object({
  targetType: z.enum(
    [
      REACTION_TARGET_TYPE.POST,
      REACTION_TARGET_TYPE.COMMENT,
      REACTION_TARGET_TYPE.STORY,
    ],
    {
      errorMap: () => ({
        message: `Target type must be one of: ${Object.values(
          REACTION_TARGET_TYPE,
        ).join(', ')}`,
      }),
    },
  ),

  targetId: z
    .string({
      required_error: 'Target ID is required',
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    })
    .transform((val) => new Types.ObjectId(val)),

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

  type: typeSchema,
});

const countsReactionsQuerySchema = getReactionQuerySchema.pick({
  targetType: true,
  targetId: true,
});

export const ReactionValidations = {
  createReactionSchema,
  getReactionQuerySchema,
  countsReactionsQuerySchema,
};
