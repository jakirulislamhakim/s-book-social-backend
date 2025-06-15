import { ObjectId } from 'mongoose';
import { POST_STATUS, POST_AUDIENCE } from './post.constant';
import { z } from 'zod';
import { PostValidations } from './post.validation';

export type TPostAudience = (typeof POST_AUDIENCE)[keyof typeof POST_AUDIENCE];

export type TPostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export type TPost = {
  _id: ObjectId;
  userId: ObjectId;
  content: string;
  media: string[];
  tags: ObjectId[];
  location: string;
  audience: TPostAudience;
  status: TPostStatus;
  removedReason: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TPostCreate = z.infer<typeof PostValidations.createPostSchema> & {
  userId: ObjectId;
  media: string[];
};

export type TPostUpdate = z.infer<typeof PostValidations.updatePostSchema>;

export type TPostRemove = z.infer<typeof PostValidations.removePostSchema>;
