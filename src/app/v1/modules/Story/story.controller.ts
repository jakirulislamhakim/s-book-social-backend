import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { StoryService } from './story.service';
import AppError from '../../errors/AppError';

const createStory = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  req.body.userId = userId;

  const image = req.file?.path;

  if (!image) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
  }

  req.body.image = image;

  const payload = await StoryService.createStory(req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Story created successfully',
    payload,
  });
});

const getArchiveStories = catchAsync(async (req, res) => {
  const userId = req.user!._id;

  const { archiveStories, pagination } = await StoryService.getArchiveStories(
    userId,
    req.query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: archiveStories.length
      ? 'Archive stories fetched successfully'
      : 'Currently you have no archive stories',
    payload: archiveStories,
    pagination,
  });
});

const getActiveStoryByUserId = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const { id: otherUserId } = req.params;

  const payload = await StoryService.getActiveStoryByUserId(
    userId,
    otherUserId,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload.length > 0
        ? 'The user story fetched successfully'
        : 'The user has no active story',
    payload,
  });
});

const createStoryView = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const { id: storyId } = req.params;

  const payload = await StoryService.createStoryView(storyId, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message:
      payload.matchedCount === 0
        ? 'The story viewed successfully'
        : 'You have already viewed this story',
    payload: null,
  });
});

const reactingInStory = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const { id: storyId } = req.params;

  await StoryService.reactingInStory(storyId, userId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `You have reacted ${req.body?.reactionType} in this story.`,
    payload: null,
  });
});

const getStoryViews = catchAsync(async (req, res) => {
  const { id: storyId } = req.params;
  const userId = req.user!._id;

  const payload = await StoryService.getStoryViews(userId, storyId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Story views fetched successfully',
    payload,
  });
});

const getStoryById = catchAsync(async (req, res) => {
  const { id: storyId } = req.params;
  const userId = req.user!._id;

  const payload = await StoryService.getStoryById(userId, storyId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The story fetched successfully',
    payload,
  });
});

const deleteStoryById = catchAsync(async (req, res) => {
  const { id: storyId } = req.params;
  const userId = req.user!._id;

  await StoryService.deleteStoryById(userId, storyId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The story deleted successfully',
    payload: null,
  });
});

const getStoriesForFeed = catchAsync(async (req, res) => {
  const userId = req.user!._id;

  const stories = await StoryService.getStoriesForFeed(userId);
  // const { stories, pagination } = await StoryService.getStoriesForFeed(
  //   userId,
  //   req.query,
  // );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      stories.length > 0
        ? 'Successfully fetched stories for your feed.'
        : 'No stories found for your feed.',
    payload: stories,
    // pagination,
  });
});

export const StoryController = {
  createStory,
  getArchiveStories,
  getActiveStoryByUserId,
  createStoryView,
  reactingInStory,
  getStoryViews,
  getStoryById,
  deleteStoryById,
  getStoriesForFeed,
};
