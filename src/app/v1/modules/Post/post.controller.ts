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
  const { posts, pagination } = await PostServices.getMyPostsFromDB(
    req.user!._id,
    req.query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      posts.length > 0
        ? 'Your posts fetched successfully'
        : "You haven't posted anything yet .",
    payload: posts,
    pagination,
  });
});

const getPostById = catchAsync(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user!._id;
  const payload = await PostServices.getPostByIdFromDB(postId, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Post fetched successfully',
    payload,
  });
});

const getPostsByUserId = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { posts, pagination } = await PostServices.getPostsByUserIdFromDB(
    id,
    req.user!._id,
    req.query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      posts.length > 0
        ? 'Your posts fetched successfully.'
        : 'The user has no posts yet.',
    payload: posts,
    pagination,
  });
});

export const PostControllers = {
  createPost,
  getMyPosts,
  getPostById,
  getPostsByUserId,
};
