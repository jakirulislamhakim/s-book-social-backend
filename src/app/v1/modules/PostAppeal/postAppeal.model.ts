import { Schema, model } from 'mongoose';
import { TPostAppeal } from './postAppeal.interface';
import { POST_APPEAL_STATUS } from './postAppeal.constant';

const postAppealSchema = new Schema<TPostAppeal>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(POST_APPEAL_STATUS),
      default: POST_APPEAL_STATUS.PENDING,
    },
    adminResponse: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'appealedAt',
      updatedAt: false,
    },
    versionKey: false,
  },
);

postAppealSchema.virtual('post', {
  ref: 'Post',
  localField: 'postId',
  foreignField: '_id',
  justOne: true,
});

postAppealSchema.set('toObject', { virtuals: true });
postAppealSchema.set('toJSON', { virtuals: true });

postAppealSchema.index({ postId: 1, status: 1 });

export const PostAppeal = model<TPostAppeal>(
  'PostAppeal',
  postAppealSchema,
  'post_appeals',
);
