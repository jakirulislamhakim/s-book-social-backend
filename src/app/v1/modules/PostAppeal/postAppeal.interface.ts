import { PostAppealValidations } from './postAppeal.validation';
import { Types } from 'mongoose';
import { z } from 'zod';
import { POST_APPEAL_STATUS } from './postAppeal.constant';

type TPostAppealStatus =
  (typeof POST_APPEAL_STATUS)[keyof typeof POST_APPEAL_STATUS];

export type TPostAppeal = {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  status: TPostAppealStatus;
  adminResponse?: string;
  appealedAt: Date;
  resolvedAt?: Date;
};

export type TPostAppealCreate = z.infer<
  typeof PostAppealValidations.createPostAppealSchema
>;

export type TPostAppealAdminResponse = z.infer<
  typeof PostAppealValidations.appealAdminResponseSchema
>;
