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
import { Types } from 'mongoose';
import { USER_STATUS } from '../User/user.constant';

const createPostIntoDB = async (payload: TPostCreate) => {
  const { tags } = payload;

  // check tags users exists or not
  if (tags && tags.length > 0) {
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
      .select('_id status')
      .lean();

    const foundUserIds = existingUsers.map((user) => user._id.toString());

    const notFoundUser = tags.filter((id) => !foundUserIds.includes(id));

    if (notFoundUser.length > 0) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `The users you tags are not found. (${notFoundUser.join(', ')})`,
      );
    }

    // fixme (friends) : need to check tags users is their must be friends
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
      "The post is removed . You can't see the post !",
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

  // fixme (friends): check post audience and filter  who can see post which type public only or friends &  public (currentUser & postUser relation)

  const postQuery = new QueryBuilder(
    Post.find({
      userId: postUserId,
      status: { $eq: POST_STATUS.ACTIVE },
      audience: { $ne: POST_AUDIENCE.PRIVATE }, // fixme:
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
    },
  )
    // .select('')
    .lean();

  return removedPost;
};

const restorePostByAdminIntoDB = async (postId: string) => {
  const post = await Post.findById(postId).select('status');

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.status === POST_STATUS.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The post is already active !');
  }

  const activePost = await Post.findByIdAndUpdate(
    postId,
    {
      status: POST_STATUS.ACTIVE,
      removedReason: '',
    },
    {
      new: true,
    },
  )
    // .select('')
    .lean();

  return activePost;
};

export const PostServices = {
  createPostIntoDB,
  getMyPostsFromDB,
  getPostByIdFromDB,
  updatePostByIdIntoDB,
  deletePostByIdFromDB,
  getOtherUserPostsFromDB,
  removePostByAdminIntoDB,
  restorePostByAdminIntoDB,
};
