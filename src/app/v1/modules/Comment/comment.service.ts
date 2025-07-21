import httpStatus from 'http-status';
import { Post } from '../Post/post.model';
import { TCommentCreate, TCommentUpdate } from './comment.interface';
import AppError from '../../errors/AppError';
import { POST_AUDIENCE, POST_STATUS } from '../Post/post.constant';
import { Comment } from './comment.model';
import { Friend } from '../Friend/friend.model';
import { FRIEND_STATUS } from '../Friend/friend.constant';
import { CommentUtils } from './comment.utils';
import { Types } from 'mongoose';
import { USER_STATUS } from '../User/user.constant';

const createOrReplyComment = async (payload: TCommentCreate) => {
  const { postId, content, parentId, authorId } = payload;

  const existingPost = await Post.findOne({
    _id: postId,
    status: POST_STATUS.ACTIVE,
  })
    .select('_id audience userId')
    .lean();

  if (!existingPost) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  const { audience, userId } = existingPost;

  if (
    audience === POST_AUDIENCE.PRIVATE &&
    authorId.toString() !== userId.toString()
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not comment on this post',
    );
  }

  if (audience === POST_AUDIENCE.FRIENDS) {
    const isFriend = await Friend.exists({
      $or: [
        { senderId: authorId, receiverId: userId },
        { senderId: userId, receiverId: authorId },
      ],
      status: { $eq: FRIEND_STATUS.ACCEPTED },
    });

    if (!isFriend) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'The post audience is friends. You can not comment on this post',
      );
    }
  }

  const mentionUsernames = CommentUtils.extractMentionsFromContent(content);

  //* only mention at a time one user
  // const mentions = await User.find({
  //   username: { $in: mentionUsernames },
  // }).select('_id');

  const mentions = await CommentUtils.getMentionsUserIds(mentionUsernames);

  // check parent comment exist or not then increment reply count & create reply comment
  if (parentId) {
    const existingParentComment = await Comment.findByIdAndUpdate(
      parentId,
      {
        $inc: { replyCount: 1 },
      },
      {
        new: true,
        timestamps: false,
      },
    )
      .lean()
      .select('_id parentId');

    if (!existingParentComment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "You can't reply non existing comment!",
      );
    }

    if (existingParentComment.parentId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You can not reply on reply comment. You can reply only top level comment',
      );
    }

    const createCommentReply = await Comment.create({
      ...payload,
      mentions,
    });

    return createCommentReply;
  }

  const createComment = await Comment.create({
    ...payload,
    mentions,
  });

  return createComment;
};

const getTopLevelComments = async (
  postId: string,
  query: Record<string, string>,
) => {
  const isExistPost = await Post.exists({
    _id: postId,
  });

  if (!isExistPost) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  const comments = await Comment.find({
    postId,
    parentId: null,
  })
    .populate({
      path: 'author',
      select: '_id fullName profilePhoto',
    })
    .populate({
      path: 'mentions',
      select: '_id username',
      match: { isVerified: true, status: { $eq: USER_STATUS.ACTIVE } },
    })
    .lean({ virtuals: true })
    .sort(query.sort ?? '-createdAt');

  return comments;
};

const getReplyComments = async (commentId: string) => {
  const comment = await Comment.findOne({
    _id: commentId,
  })
    .select('replyCount')
    .lean();

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'The comment is not found !');
  }

  if (comment.replyCount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This comment has no replies');
  }

  const repliesComments = await Comment.find({
    parentId: commentId,
  })
    .populate({
      path: 'author',
      select: '_id fullName profilePhoto',
    })
    .populate({
      path: 'mentions',
      select: '_id username',
      match: { isVerified: true, status: { $eq: USER_STATUS.ACTIVE } },
    })
    .sort('createdAt')
    .lean();

  return repliesComments;
};

const updateComment = async (
  commentId: string,
  { content, authorId }: TCommentUpdate,
) => {
  const existingComment = await Comment.findById(commentId)
    .select('_id authorId')
    .lean();

  if (!existingComment) {
    throw new AppError(httpStatus.NOT_FOUND, 'The comment is not found !');
  }

  if (existingComment.authorId.toString() !== authorId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not update other user comment !',
    );
  }

  const mentionUsernames = CommentUtils.extractMentionsFromContent(content);

  const mentions = await CommentUtils.getMentionsUserIds(mentionUsernames);

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
      mentions,
      isEdited: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return updateComment;
};

const deleteComment = async (
  currentUserId: Types.ObjectId,
  commentId: string,
) => {
  const comment = await Comment.findById(commentId)
    .select('_id authorId parentId postId')
    .lean();

  if (!comment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The comment you want to delete is not found !',
    );
  }

  const { authorId, parentId, postId } = comment;

  const post = await Post.findById(postId).select('userId status').lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.status === POST_STATUS.REMOVED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not add or delete comment on removed post !',
    );
  }

  const isTopLevel = !parentId;

  const canDelete =
    post.userId.toString() === currentUserId.toString() ||
    authorId.toString() === currentUserId.toString();

  if (!canDelete) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not delete other user comment !',
    );
  }

  // delete comment
  await Comment.findByIdAndDelete(commentId);

  // delete reply comments if it is top level
  if (isTopLevel) {
    await Comment.deleteMany({ parentId: commentId });
  }
};

export const CommentServices = {
  createOrReplyComment,
  getTopLevelComments,
  getReplyComments,
  updateComment,
  deleteComment,
};
