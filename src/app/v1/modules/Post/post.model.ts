import { Schema, model } from 'mongoose';
import { TPost } from './post.interface';
import { POST_STATUS, POST_AUDIENCE } from './post.constant';

const postSchema = new Schema<TPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
      },
    ],
    media: {
      type: [String],
      default: [],
    },
    tags: {
      type: [Schema.Types.ObjectId],
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
