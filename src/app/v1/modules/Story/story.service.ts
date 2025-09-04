import { Types } from 'mongoose';
import { getMentionUserIdsFromContent } from '../../utils/getMentionUserIdsFromContent';
import { TStoryCreate, TStoryReacting } from './story.interface';
import { Story, StoryView } from './story.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../User/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Friend } from '../Friend/friend.model';
import { STORY_VISIBILITY } from './story.constant';
import { FRIEND_STATUS } from '../Friend/friend.constant';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from '../Notification/notification.constant';
import { TNotificationCreate } from '../Notification/notification.interface';
import { Profile } from '../Profile/profile.model';
import { NotificationUtils } from '../Notification/notification.utils';

const createStory = async (payload: TStoryCreate) => {
  const mentions = await getMentionUserIdsFromContent(payload.content || '');

  const creatingStroy = await Story.create({ ...payload, mentions });

  const profile = await Profile.findOne({ userId: payload.userId })
    .select('fullName')
    .lean();

  if (mentions && mentions.length > 0) {
    const notificationData: TNotificationCreate[] = mentions.map(
      (mentionId) => ({
        action: NOTIFICATION_ACTION.MENTIONED,
        message: `${profile?.fullName} mentioned you in a story`,
        receiverId: new Types.ObjectId(mentionId),
        senderId: payload.userId,
        targetType: NOTIFICATION_TARGET_TYPE.STORY,
        targetId: creatingStroy._id,
        url: `/stories/${creatingStroy._id}`,
        url_method: NOTIFICATION_URL_METHOD.GET,
      }),
    );

    await NotificationUtils.createNotification(notificationData);
  }

  return creatingStroy;
};

const getArchiveStories = async (
  userId: Types.ObjectId,
  query: Record<string, unknown>,
) => {
  const currentDate = new Date();

  const archiveStoriesQuery = new QueryBuilder(
    Story.find({ userId, expiresAt: { $lte: currentDate } }),
    query,
  )
    .fields()
    .paginate()
    .sort();

  const archiveStories = await archiveStoriesQuery.modelQuery
    .populate({
      path: 'mentions',
      select: '_id fullName profilePhoto',
    })
    .lean();

  const pagination = await archiveStoriesQuery.paginateMeta();

  return {
    archiveStories,
    pagination,
  };
};

const getActiveStoryByUserId = async (
  userId: Types.ObjectId,
  otherUserId: string,
) => {
  const existingUser = await User.exists({ _id: otherUserId });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  const hasFriend = await Friend.exists({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
    status: FRIEND_STATUS.ACCEPTED,
  });

  const isMe = userId.toString() === otherUserId.toString();

  const visibleAudience = isMe
    ? [
        STORY_VISIBILITY.PRIVATE,
        STORY_VISIBILITY.FRIENDS,
        STORY_VISIBILITY.PUBLIC,
      ]
    : hasFriend
      ? [STORY_VISIBILITY.PUBLIC, STORY_VISIBILITY.FRIENDS]
      : [STORY_VISIBILITY.PUBLIC];

  const result = await Story.find({
    userId: otherUserId,
    expiresAt: { $gte: new Date() },
    visibility: { $in: visibleAudience },
  })
    .populate({
      path: 'userId',
      select: '_id fullName profilePhoto',
    })
    .populate({
      path: 'mentions',
      select: '_id fullName profilePhoto',
    })
    .lean();

  return result;
};

const createStoryView = async (storyId: string, userId: Types.ObjectId) => {
  const existingStory = await Story.exists({ _id: storyId });

  if (!existingStory) {
    throw new AppError(httpStatus.NOT_FOUND, 'The story is not found');
  }

  // todo: i can add more logic here like check if the story is visible to the user but
  //*  i don't want to do that because when user see the story he will not be able to see the story

  const result = await StoryView.updateOne(
    { storyId, userId },
    { storyId, userId },
    { upsert: true },
  );

  if (result.upsertedCount === 1) {
    await Story.updateOne({ _id: storyId }, { $inc: { viewCounts: 1 } });
  }

  return result;
};

const reactingInStory = async (
  storyId: string,
  userId: Types.ObjectId,
  payload: TStoryReacting,
) => {
  const existingStory = await Story.findOne({ _id: storyId })
    .select('_id userId')
    .lean();

  if (!existingStory) {
    throw new AppError(httpStatus.NOT_FOUND, 'The story is not found');
  }

  if (userId.equals(existingStory.userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not react in your own story',
    );
  }

  const reaction = await StoryView.updateOne(
    { storyId, userId },
    { storyId, userId, reactionType: payload.reactionType },
    { upsert: true, runValidators: true },
  );

  if (reaction.upsertedCount === 1) {
    await Story.updateOne({ _id: storyId }, { $inc: { viewCounts: 1 } });
  }
};

const getStoryViews = async (userId: Types.ObjectId, storyId: string) => {
  const existingStory = await Story.findOne({ _id: storyId })
    .select('_id userId')
    .lean();

  if (!existingStory) {
    throw new AppError(httpStatus.NOT_FOUND, 'The story is not found');
  }

  if (!userId.equals(existingStory.userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You will not be able to view other user's story",
    );
  }

  const result = await StoryView.find({ storyId })
    .populate({
      path: 'userId',
      select: '_id fullName profilePhoto',
    })
    .select('-storyId')
    .lean();
  return result;
};

const getStoryById = async (userId: Types.ObjectId, storyId: string) => {
  const existingStory = await Story.findOne({ _id: storyId })
    .select('_id userId')
    .lean();

  if (!existingStory) {
    throw new AppError(httpStatus.NOT_FOUND, 'The story is not found');
  }

  const hasFriend = await Friend.exists({
    $or: [
      { receiverId: userId, senderId: existingStory.userId },
      { receiverId: existingStory.userId, senderId: userId },
    ],
    status: FRIEND_STATUS.ACCEPTED,
  });

  const isMe = userId.equals(existingStory.userId);

  const visibility = isMe
    ? [
        STORY_VISIBILITY.PRIVATE,
        STORY_VISIBILITY.FRIENDS,
        STORY_VISIBILITY.PUBLIC,
      ]
    : hasFriend
      ? [STORY_VISIBILITY.FRIENDS, STORY_VISIBILITY.PUBLIC]
      : [STORY_VISIBILITY.PUBLIC];

  const result = await Story.findOne({
    _id: storyId,
    expiresAt: { $gte: new Date() },
    // visibility: { $in: visibility },
  })
    .populate({
      path: 'userId',
      select: '_id fullName profilePhoto',
    })
    .populate({
      path: 'mentions',
      select: '_id fullName profilePhoto',
    })
    .lean();

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The story is expired!');
  }

  if (!visibility.includes(result.visibility)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't view this story for the specified visibility",
    );
  }

  return result;
};

const deleteStoryById = async (userId: Types.ObjectId, storyId: string) => {
  const existingStory = await Story.findOne({ _id: storyId })
    .select('_id userId')
    .lean();

  if (!existingStory) {
    throw new AppError(httpStatus.NOT_FOUND, 'The story is not found');
  }

  if (!userId.equals(existingStory.userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this story.',
    );
  }

  await Story.deleteOne({ _id: storyId });

  await StoryView.deleteMany({ storyId });
};

const getStoriesForFeed = async (
  userId: Types.ObjectId,
  // query: Record<string, unknown>,
) => {
  const followingAndFriends = await Friend.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
    // status: FRIEND_STATUS.ACCEPTED,
  })
    .select('receiverId senderId status')
    .lean();

  const friendIds: Types.ObjectId[] = [];
  const followingIds: Types.ObjectId[] = [];

  for (const friend of followingAndFriends) {
    if (friend.status === FRIEND_STATUS.ACCEPTED) {
      if (userId.equals(friend.senderId)) {
        friendIds.push(friend.receiverId);
      } else {
        friendIds.push(friend.senderId);
      }
    } else if (
      friend.status === FRIEND_STATUS.PENDING &&
      userId.equals(friend.senderId)
    ) {
      followingIds.push(friend.receiverId);
    }
  }

  // condition for story visibility
  const condition = [
    // own stories
    { userId },

    // friends stories : friends and public visibility
    {
      userId: { $in: friendIds },
      visibility: {
        $in: [STORY_VISIBILITY.FRIENDS, STORY_VISIBILITY.PUBLIC],
      },
    },

    // following stories : public visibility
    { userId: { $in: followingIds }, visibility: STORY_VISIBILITY.PUBLIC },
  ];

  //   const storiesQuery = new QueryBuilder(
  //     Story.find({
  //       $or: condition,
  //       expiresAt: { $gte: new Date() },
  //     }),
  //     query,
  //   )
  //     .fields()
  //     .paginate()
  //     .sort();

  //   const stories = await storiesQuery.modelQuery
  //     .populate({
  //       path: 'userId',
  //       select: '_id fullName profilePhoto',
  //     })
  //     .lean();

  //   const pagination = await storiesQuery.paginateMeta();

  //   return {
  //     stories,
  //     pagination,
  //   };

  // const stories = await Story.aggregate([
  //   {
  //     $match: {
  //       $or: condition,
  //       expiresAt: { $gte: new Date() },
  //     },
  //   },
  //   {
  //     $sort: {
  //       createdAt: -1,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: '$userId',
  //       stories: {
  //         $push: {
  //           _id: '$_id',
  //           image: '$image',
  //           content: '$content',
  //           mentions: '$mentions',
  //           visibility: '$visibility',
  //           // viewCounts: '$viewCounts',
  //           createdAt: '$createdAt',
  //           expiresAt: '$expiresAt',
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       localField: '_id',
  //       foreignField: 'userId',
  //       as: 'user',
  //       from: 'profiles',
  //     },
  //   },
  //   {
  //     $unwind: '$user',
  //   },
  //   {
  //     $project: {
  //       user: {
  //         userId: '$user._id',
  //         fullName: '$user.fullName',
  //         profilePhoto: '$user.profilePhoto',
  //       },
  //       stories: '$stories',
  //     },
  //   },

  //   {
  //     $unwind: '$stories',
  //   },
  //   {
  //     $lookup: {
  //       from: 'profiles',
  //       localField: 'stories.mentions',
  //       foreignField: 'userId',
  //       as: 'stories.mentionUsers',
  //     },
  //   },
  //   {
  //     $addFields: {
  //       'stories.mentionUsers': {
  //         $map: {
  //           input: '$stories.mentionUsers',
  //           as: 'mentionUser',
  //           in: {
  //             _id: '$$mentionUser._id',
  //             fullName: '$$mentionUser.fullName',
  //             profilePhoto: '$$mentionUser.profilePhoto',
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       'stories.mentions': 0,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: '$_id',
  //       user: { $first: '$user' },
  //       stories: {
  //         $push: '$stories',
  //       },
  //     },
  //   },
  // ]);

  const stories = await Story.aggregate([
    {
      $match: {
        $or: condition, // your condition for friends, followings, public
        expiresAt: { $gte: new Date() },
      },
    },
    {
      $addFields: {
        priority: {
          $cond: [{ $eq: ['$userId', userId] }, 0, 1],
          //  if story belongs to logged-in user → priority 0
          // otherwise → priority 1
        },
      },
    },
    {
      $sort: {
        priority: 1, // owner first
        createdAt: -1, // latest stories next
      },
    },
    {
      $group: {
        _id: '$userId',
        stories: {
          $push: {
            _id: '$_id',
            image: '$image',
            content: '$content',
            mentions: '$mentions',
            viewCounts: '$viewCounts',
            visibility: '$visibility',
            createdAt: '$createdAt',
            expiresAt: '$expiresAt',
          },
        },
        priority: { $first: '$priority' },
      },
    },
    {
      $lookup: {
        localField: '_id',
        foreignField: 'userId',
        as: 'user',
        from: 'profiles',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        user: {
          userId: '$user._id',
          fullName: '$user.fullName',
          profilePhoto: '$user.profilePhoto',
        },
        stories: 1,
        priority: 1,
      },
    },
    { $sort: { priority: 1 } }, // again to ensure owner is always first
    //! i can do also more like pagination and remove  priority field by project pipeline
  ]);

  return stories;
};

export const StoryService = {
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
