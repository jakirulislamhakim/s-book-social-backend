import { Types } from 'mongoose';
import { z } from 'zod';
import { CommentValidation } from './comment.validation';

export type TComment = {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  mentions: Types.ObjectId[];
  parentId: Types.ObjectId | null;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TAuthorId = {
  authorId: Types.ObjectId;
};
export type TCommentCreate = z.infer<
  typeof CommentValidation.createCommentSchema
> &
  TAuthorId;

export type TCommentUpdate = z.infer<
  typeof CommentValidation.updateCommentSchema
> &
  TAuthorId;
