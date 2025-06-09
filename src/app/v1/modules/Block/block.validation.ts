import { Types } from 'mongoose';
import { z } from 'zod';

const createUserBlock = z.object({
  blockedId: z
    .string({
      required_error: 'Blocked ID is required',
    })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid mongo object ID format',
    }),
});

export const UserBlockValidations = {
  createUserBlock,
};
