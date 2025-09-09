import { UserBlockUtils } from './../Block/block.utils';
import httpStatus from 'http-status';
import { Post } from '../Post/post.model';
import { TCommentCreate, TCommentUpdate } from './comment.interface';
import AppError from '../../errors/AppError';
import { POST_AUDIENCE, POST_STATUS } from '../Post/post.constant';
import { Comment } from './comment.model';
import { Friend } from '../Friend/friend.model';
import { FRIEND_STATUS } from '../Friend/friend.constant';
import { Types } from 'mongoose';
import { USER_STATUS } from '../User/user.constant';
import { getMentionUserIdsFromContent } from '../../utils/getMentionUserIdsFromContent';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from '../Notification/notification.constant';
import { NotificationUtils } from '../Notification/notification.utils';
import { Profile } from '../Profile/profile.model';
import { TNotificationCreate } from '../Notification/notification.interface';

const createOrReplyComment = async (payload: TCommentCreate) => {
  const { postId, content, parentId, authorId: commentAuthorId } = payload;

  // todo use transactions for create comment and notification

  const existingPost = await Post.findOne({
    _id: postId,
    status: POST_STATUS.ACTIVE,
  })
    .select('_id audience userId')
    .lean();

  if (!existingPost) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  const { audience, userId: postAuthorId } = existingPost;

  // check they are blocked or not if they are blocked then throw error
  await UserBlockUtils.checkMutualBlock(commentAuthorId, postAuthorId);

  if (
    audience === POST_AUDIENCE.PRIVATE &&
    commentAuthorId.toString() !== postAuthorId.toString()
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not comment on this post',
    );
  }

  if (audience === POST_AUDIENCE.FRIENDS) {
    const isFriend = await Friend.exists({
      $or: [
        { senderId: commentAuthorId, receiverId: postAuthorId },
        { senderId: postAuthorId, receiverId: commentAuthorId },
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

  const mentions = await getMentionUserIdsFromContent(content);

  const profile = await Profile.findOne({ userId: commentAuthorId })
    .select('fullName')
    .lean();

  if (mentions.length > 0) {
    const data: TNotificationCreate[] = mentions.map((mentionUserId) => ({
      action: NOTIFICATION_ACTION.MENTIONED,
      message: `${profile?.fullName} mentioned you in a comment`,
      receiverId: mentionUserId,
      senderId: commentAuthorId,
      targetType: NOTIFICATION_TARGET_TYPE.POST,
      targetId: new Types.ObjectId(postId),
      url: `/posts/${postId}`,
      url_method: NOTIFICATION_URL_METHOD.GET,
    }));

    await NotificationUtils.createNotification(data);
  }

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
      .select('_id parentId authorId');

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

    if (
      existingParentComment.authorId.toString() !== commentAuthorId.toString()
    ) {
      await NotificationUtils.createNotification({
        action: NOTIFICATION_ACTION.REPLIED,
        message: `${profile?.fullName} replied on your comment`,
        receiverId: existingParentComment.authorId,
        senderId: commentAuthorId,
        targetType: NOTIFICATION_TARGET_TYPE.POST,
        targetId: new Types.ObjectId(postId),
        url: `/posts/${postId}`,
        url_method: NOTIFICATION_URL_METHOD.GET,
      });
    }
    return createCommentReply;
  }

  const createComment = await Comment.create({
    ...payload,
    mentions,
  });

  if (commentAuthorId.toString() !== postAuthorId.toString()) {
    await NotificationUtils.createNotification({
      action: NOTIFICATION_ACTION.COMMENTED,
      message: `${profile?.fullName} commented on your post`,
      receiverId: postAuthorId,
      senderId: commentAuthorId,
      targetType: NOTIFICATION_TARGET_TYPE.POST,
      targetId: new Types.ObjectId(postId),
      url: `/posts/${postId}`,
      url_method: NOTIFICATION_URL_METHOD.GET,
    });
  }

  return createComment;
};

const getTopLevelComments = async (
  userId: Types.ObjectId,
  postId: string,
  query: Record<string, string>,
) => {
  const post = await Post.findById(postId).select('userId').lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  // check they are blocked or not if they are blocked then throw error
  await UserBlockUtils.checkMutualBlock(userId, post.userId);

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

const getReplyComments = async (
  currentUserId: Types.ObjectId,
  commentId: string,
) => {
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

  const excludedCommentIds =
    await UserBlockUtils.getExcludedUserIds(currentUserId);

  const repliesComments = await Comment.find({
    parentId: commentId,
    authorId: { $nin: excludedCommentIds },
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

  const mentions = await getMentionUserIdsFromContent(content);

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

  const profile = await Profile.findOne({ userId: authorId })
    .select('fullName')
    .lean();

  if (mentions.length > 0) {
    const data: TNotificationCreate[] = mentions.map((mentionUserId) => ({
      action: NOTIFICATION_ACTION.MENTIONED,
      message: `${profile?.fullName} mentioned you in a comment`,
      receiverId: mentionUserId,
      senderId: authorId,
      targetType: NOTIFICATION_TARGET_TYPE.COMMENT,
      targetId: new Types.ObjectId(commentId),
      url: `/posts/${existingComment.postId}`,
      url_method: NOTIFICATION_URL_METHOD.GET,
    }));

    await NotificationUtils.createNotification(data);
  }

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
