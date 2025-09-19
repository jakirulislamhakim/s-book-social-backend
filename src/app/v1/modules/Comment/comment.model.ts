import { model, Schema, Types } from 'mongoose';
import { TComment } from './comment.interface';

const commentSchema = new Schema<TComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    content: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: 'Comment', default: null },
    mentions: [{ type: Types.ObjectId, ref: 'User' }],
    replyCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: 'editedAt',
    },
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

commentSchema.virtual('author', {
  ref: 'Profile',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

commentSchema.index({ authorId: 1 }).index({ postId: 1 });

export const Comment = model<TComment>('Comment', commentSchema);
