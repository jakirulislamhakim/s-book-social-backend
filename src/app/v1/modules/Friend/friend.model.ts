import { Schema, model } from 'mongoose';
import { TFriend } from './friend.interface';
import { FRIEND_STATUS } from './friend.constant';

const friendSchema = new Schema<TFriend>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(FRIEND_STATUS),
      default: 'pending',
    },
    rejectedAt: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'requestedAt',
      updatedAt: true,
    },
    versionKey: false,
  },
);

friendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
friendSchema.index({ senderId: 1, status: 1, requestedAt: -1 });
friendSchema.index({ receiverId: 1, status: 1, requestedAt: -1 });

// delete rejected friend request after 7 days to send new friend request
friendSchema.index({ rejectedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export const Friend = model<TFriend>('Friend', friendSchema);
