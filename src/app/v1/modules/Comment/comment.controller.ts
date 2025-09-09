import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { CommentServices } from './comment.service';

const createOrReplyComment = catchAsync(async (req, res) => {
  const authorId = req.user!._id;

  const comment = await CommentServices.createOrReplyComment({
    ...req.body,
    authorId,
  });

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'You have comment successfully the post.',
    payload: comment,
  });
});

const getTopLevelComments = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user!._id;

  const payload = await CommentServices.getTopLevelComments(
    userId,
    postId,
    req.query as Record<string, string>,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload.length > 0
        ? 'Comments fetched successfully for this post.'
        : 'No comments yet for this post.',
    payload,
  });
});

const getReplyComments = catchAsync(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user!._id;

  const payload = await CommentServices.getReplyComments(currentUserId, id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Comment replies fetched successfully',
    payload,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const { id: commentId } = req.params;
  const authorId = req.user!._id;
  const payload = await CommentServices.updateComment(commentId, {
    ...req.body,
    authorId,
  });

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Your comment has been updated successfully.',
    payload,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const { id: commentId } = req.params;
  const authorId = req.user!._id;
  await CommentServices.deleteComment(authorId, commentId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The comment has been deleted successfully.',
    payload: null,
  });
});

export const CommentControllers = {
  createOrReplyComment,
  getTopLevelComments,
  getReplyComments,
  updateComment,
  deleteComment,
};
