import { model, Schema } from 'mongoose';
import { TReaction } from './reaction.interface';
import { REACTION_TARGET_TYPE, REACTION_TYPE } from './reaction.constant';

const reactionSchema = new Schema<TReaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: Object.values(REACTION_TARGET_TYPE),
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(REACTION_TYPE),
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

export const Reaction = model<TReaction>('Reaction', reactionSchema);
