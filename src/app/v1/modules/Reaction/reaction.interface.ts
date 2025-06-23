import { Types } from 'mongoose';
import { REACTION_TARGET_TYPE, REACTION_TYPE } from './reaction.constant';
import { z } from 'zod';
import { ReactionValidations } from './reaction.validation';

type TReactionTargetType =
  (typeof REACTION_TARGET_TYPE)[keyof typeof REACTION_TARGET_TYPE];

type TReactionType = (typeof REACTION_TYPE)[keyof typeof REACTION_TYPE];

export type TReaction = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetType: TReactionTargetType;
  targetId: Types.ObjectId;
  type: TReactionType;
  createdAt: Date;
};

export type TReactionCreate = z.infer<
  typeof ReactionValidations.createReactionSchema
>;

export type TReactionQuery = z.infer<
  typeof ReactionValidations.getReactionQuerySchema
>;

export type TReactionCountQuery = z.infer<
  typeof ReactionValidations.countsReactionsQuerySchema
>;
