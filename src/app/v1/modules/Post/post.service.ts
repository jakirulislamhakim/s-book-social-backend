import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { TPostCreate, TPostRemove, TPostUpdate } from './post.interface';
import { Post } from './post.model';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  POST_AUDIENCE,
  POST_SEARCHABLE_FIELDS,
  POST_STATUS,
} from './post.constant';
import mongoose, { Types } from 'mongoose';
import { USER_STATUS } from '../User/user.constant';
import { PostAppeal } from '../PostAppeal/postAppeal.model';
import { POST_APPEAL_STATUS } from '../PostAppeal/postAppeal.constant';
import { TPostAppealAdminResponse } from '../PostAppeal/postAppeal.interface';
import { Friend } from '../Friend/friend.model';
import { FRIEND_STATUS } from '../Friend/friend.constant';

const createPostIntoDB = async (payload: TPostCreate) => {
  const { tags, userId } = payload;

  // check tags users exists or not
  if (tags && tags.length > 0) {
    if (tags.includes(userId.toString())) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You can not tag yourself in your post . Please remove yourself from tags',
      );
    }

    // check duplicate users tags

    if (new Set(tags).size !== tags.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can't tags user multiple times in a post",
      );
    }

    const existingUsers = await User.find({
      _id: { $in: tags },
      isVerified: true,
      status: { $eq: USER_STATUS.ACTIVE },
    })
      .select('_id')
      .lean();

    const foundUserIds = existingUsers.map((user) => user._id.toString());

    const notFoundUser = tags.filter((id) => !foundUserIds.includes(id));

    if (notFoundUser.length > 0) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Some users you are trying to tag could not be found: ${notFoundUser.join(', ')}`,
      );
    }

    const isTagUserFriends = await Friend.find({
      $or: [{ senderId: { $in: tags } }, { receiverId: { $in: tags } }],
      status: { $eq: FRIEND_STATUS.ACCEPTED },
    })
      .select('_id')
      .lean();

    if (isTagUserFriends.length !== tags.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You can only tag users who are your friends. Some selected users are not in your friend list.',
      );
    }
  }

  const post = await Post.create(payload);
  return post;
};

const getMyPostsFromDB = async (
  userId: Types.ObjectId,
  query: Record<string, unknown>,
) => {
  const postQuery = new QueryBuilder(Post.find({ userId }), query)
    .search(POST_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const posts = await postQuery.modelQuery
    .populate({
      path: 'tags',
      select: 'userId fullName profilePhoto',
    })
    .lean();
  const pagination = await postQuery.paginateMeta();

  return {
    posts,
    pagination,
  };
};

const getPostByIdFromDB = async (postId: string, userId: Types.ObjectId) => {
  const post = await Post.findById(postId)
    .populate({
      path: 'tags',
      select: 'userId fullName profilePhoto',
    })
    .lean();

  // check post exists & removed
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  const isNotPostOwner = userId.toString() !== post.userId.toString();

  // check post visibility
  if (post.audience === POST_AUDIENCE.PRIVATE) {
    if (isNotPostOwner) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "The post is private . You can't see the post !",
      );
    }
  }

  if (post.status === POST_STATUS.REMOVED && isNotPostOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "The post is removed by admin . You can't see the post !",
    );
  }

  return post;
};

const updatePostByIdIntoDB = async (
  userId: Types.ObjectId,
  postId: string,
  payload: TPostUpdate,
) => {
  const post = await Post.findById(postId).select('userId status').lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not update other user post !',
    );
  }

  if (post.status === POST_STATUS.REMOVED) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can not update this post !');
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, payload, {
    new: true,
  })
    .populate({
      path: 'tags',
      select: 'userId fullName profilePhoto',
    })
    .lean();

  return updatedPost;
};

const deletePostByIdFromDB = async (userId: Types.ObjectId, postId: string) => {
  const post = await Post.findById(postId).select('userId').lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not delete other user post !',
    );
  }

  const deletedPost = await Post.findByIdAndDelete(postId);
  return deletedPost;
};

const getOtherUserPostsFromDB = async (
  postUserId: string,
  currentUserId: Types.ObjectId,
  query: Record<string, unknown>,
) => {
  if (currentUserId.toString() === postUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not see your own post by yourself',
    );
  }

  const postUser = await User.findById(postUserId).select('status').lean();

  if (!postUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  if (postUser.status !== USER_STATUS.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The user is not active');
  }

  const isFriend = await Friend.exists({
    $or: [
      { senderId: currentUserId, receiverId: postUserId },
      { senderId: postUserId, receiverId: currentUserId },
    ],
    status: { $eq: FRIEND_STATUS.ACCEPTED },
  }).lean();

  const visibleAudience = isFriend
    ? [POST_AUDIENCE.PUBLIC, POST_AUDIENCE.FRIENDS]
    : [POST_AUDIENCE.PUBLIC];

  const postQuery = new QueryBuilder(
    Post.find({
      userId: postUserId,
      status: { $eq: POST_STATUS.ACTIVE },
      audience: { $in: visibleAudience },
    }),
    query,
  )
    .search(POST_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const posts = await postQuery.modelQuery
    .populate({
      path: 'tags',
      select: 'userId fullName profilePhoto',
    })
    .select('-status -removeReason')
    .lean();

  const pagination = await postQuery.paginateMeta();

  return {
    posts,
    pagination,
  };
};

// admin services
const removePostByAdminIntoDB = async (
  postId: string,
  { removedReason }: TPostRemove,
) => {
  const post = await Post.findById(postId).select('status');

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.status === POST_STATUS.REMOVED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The post is already removed !');
  }

  const removedPost = await Post.findByIdAndUpdate(
    postId,
    {
      status: POST_STATUS.REMOVED,
      removedReason,
    },
    {
      new: true,
      timestamps: false,
    },
  )
    // .select('')
    .lean();

  return removedPost;
};

const restorePostAppealByAdmin = async (
  postId: string,
  { adminResponse }: TPostAppealAdminResponse,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const post = await Post.findById(postId).select('status').session(session);

    if (!post) {
      throw new AppError(httpStatus.NOT_FOUND, 'The post is not found!');
    }

    if (post.status === POST_STATUS.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, 'The post is already active!');
    }

    const activatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        status: POST_STATUS.ACTIVE,
        removedReason: '',
      },
      {
        new: true,
        session,
      },
    ).lean();

    await PostAppeal.findOneAndUpdate(
      { postId, status: POST_APPEAL_STATUS.PENDING },
      {
        status: POST_APPEAL_STATUS.APPROVED,
        adminResponse,
        resolvedAt: new Date(),
      },
      {
        new: true,
        session,
      },
    );

    await session.commitTransaction();

    return activatedPost;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const rejectPostAppealByAdmin = async (
  postId: string,
  { adminResponse }: TPostAppealAdminResponse,
) => {
  const existingPostAppeal = await PostAppeal.exists({
    postId,
    status: POST_APPEAL_STATUS.PENDING,
  });

  if (!existingPostAppeal) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post appeal is not found !');
  }

  const updatedPostAppeal = await PostAppeal.findOneAndUpdate(
    { postId, status: POST_APPEAL_STATUS.PENDING },
    {
      status: POST_APPEAL_STATUS.REJECTED,
      adminResponse,
      resolvedAt: new Date(),
    },
  );

  return updatedPostAppeal;
};

export const PostServices = {
  createPostIntoDB,
  getMyPostsFromDB,
  getPostByIdFromDB,
  updatePostByIdIntoDB,
  deletePostByIdFromDB,
  getOtherUserPostsFromDB,
  removePostByAdminIntoDB,
  restorePostAppealByAdmin,
  rejectPostAppealByAdmin,
};
