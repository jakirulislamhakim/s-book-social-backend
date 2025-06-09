import { Types } from 'mongoose';
import { z } from 'zod';
import { UserBlockValidations } from './block.validation';

export type TUserBlock = {
  _id: Types.ObjectId;
  blockerId: Types.ObjectId;
  blockedId: Types.ObjectId;
  createdAt: Date;
};

export type TUserBlockCreate = z.infer<
  typeof UserBlockValidations.createUserBlock
>;
