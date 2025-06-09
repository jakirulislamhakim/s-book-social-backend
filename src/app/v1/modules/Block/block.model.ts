import { model, Schema } from 'mongoose';
import { TUserBlock } from './block.interface';

const userBlockSchema = new Schema<TUserBlock>(
  {
    blockerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blockedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const UserBlock = model<TUserBlock>(
  'UserBlock',
  userBlockSchema,
  'user_blocks',
);
