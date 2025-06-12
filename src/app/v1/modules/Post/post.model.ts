import { Schema, model, Types } from 'mongoose';
import { TPost } from './post.interface';
import { POST_STATUS, POST_AUDIENCE } from './post.constant';

const postSchema = new Schema<TPost>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    media: {
      type: [String],
      default: [],
    },
    tags: {
      type: [Types.ObjectId],
      default: [],
      ref: 'Profile',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    audience: {
      type: String,
      enum: Object.values(POST_AUDIENCE),
      default: POST_AUDIENCE.PUBLIC,
    },
    status: {
      type: String,
      enum: Object.values(POST_STATUS),
      default: POST_STATUS.ACTIVE,
    },
    removedReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Post = model<TPost>('Post', postSchema);
