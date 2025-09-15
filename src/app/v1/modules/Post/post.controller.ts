import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { Express } from 'express';
import { PostServices } from './post.service';
import AppError from '../../errors/AppError';

const extractImgsURL = (
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
): string[] => {
  const allFiles = Object.values(files ?? {}).flat();
  return allFiles.map((file) => file.path);
};

const createPost = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const media: string[] = extractImgsURL(files);

  if ((!media || media.length === 0) && !req.body.content?.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please add something to your post and try again.',
    );
  }

  const body = {
    ...req.body,
    media,
    userId: req.user!._id,
  };

  const payload = await PostServices.createPostIntoDB(body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Your post has been successfully posted.',
    payload,
  });
});

const getMyPosts = catchAsync(async (req, res) => {
  const { query } = req;

  const { posts: payload, pagination } = await PostServices.getMyPostsFromDB(
    req.user!._id,
    query,
  );

  const hasQuery = Object.keys(query).length > 0;
  const hasResults = payload.length > 0;

  const message = hasResults
    ? 'Successfully fetched your posts for your profile'
    : hasQuery
      ? 'No posts matched your search criteria. Please review your filters.'
      : 'No posts available for your profile';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const getPostById = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user!._id;
  const payload = await PostServices.getPostByIdFromDB(postId, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully fetched the post',
    payload,
  });
});

const updatePostById = catchAsync(async (req, res) => {
  const { id: postId } = req.params;

  const payload = await PostServices.updatePostByIdIntoDB(
    req.user!._id,
    postId,
    req.body,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Your post successfully updated',
    payload,
  });
});

const deletePostById = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const payload = await PostServices.deletePostByIdFromDB(
    req.user!._id,
    postId,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Your post successfully deleted',
    payload,
  });
});

const getOtherUserPosts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { query } = req;

  const { posts, pagination } = await PostServices.getOtherUserPostsFromDB(
    id,
    req.user!._id,
    query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      posts.length > 0
        ? 'Successfully fetched the user posts'
        : Object.values(query).length > 0
          ? 'No posts matched your search criteria. Please review your filters.'
          : 'The user has no posts yet.',
    payload: posts,
    pagination,
  });
});

const getPostsForFeed = catchAsync(async (req, res) => {
  const currentUserId = req.user!._id;

  const { posts: payload, pagination } = await PostServices.getPostsForFeed(
    currentUserId,
    req.query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload.length > 0
        ? 'Successfully fetched posts for your feed.'
        : 'No posts available for your feed. Please add some friends to your friends list.',
    payload,
    pagination,
  });
});

// ⚠️ admin controllers

const removePostByAdmin = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const payload = await PostServices.removePostByAdminIntoDB(postId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully removed the post.',
    payload,
  });
});

const restorePostByAdmin = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const payload = await PostServices.restorePostAppealByAdmin(postId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully restored the post.',
    payload,
  });
});

const rejectPostAppealByAdmin = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const payload = await PostServices.rejectPostAppealByAdmin(postId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully rejected the post.',
    payload,
  });
});

export const PostControllers = {
  createPost,
  getMyPosts,
  getPostById,
  updatePostById,
  deletePostById,
  getOtherUserPosts,
  getPostsForFeed,

  // admin controllers
  removePostByAdmin,
  restorePostByAdmin,
  rejectPostAppealByAdmin,
};
