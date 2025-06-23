import { Types } from 'mongoose';
import { TReactionCreate, TReactionQuery } from './reaction.interface';
import { Reaction } from './reaction.model';
import { REACTION_TARGET_TYPE } from './reaction.constant';
import { Post } from '../Post/post.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { USER_STATUS } from '../User/user.constant';
import { TPagination } from '../../utils/sendApiResponse';

// create or update reaction if exist & type is provided then remove reaction
const toggleReaction = async (
  userId: Types.ObjectId,
  payload: TReactionCreate,
) => {
  const { targetId, type, targetType } = payload;

  let message = '';

  if (targetType === REACTION_TARGET_TYPE.POST) {
    const post = await Post.exists({ _id: targetId }).lean();

    if (!post) {
      throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
    }

    /* //! FIXME 
    -  i can do more validation : like userId & post userId is not friend user only give reaction only public post
    -  i avoid this validation bcz when i querying post i have to check if post is public or not and which user can see the post
    */
  }
  // TODO : Extend this to check COMMENT and STORY targets

  const existReaction = await Reaction.findOne({
    userId,
    targetType,
    targetId,
  })
    .select('_id type')
    .lean();

  if (!existReaction && !type) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You haven't reacted to this ${targetType} yet. Please react first`,
    );
  }

  // check if reaction already exist
  if (existReaction && existReaction.type === type) {
    message = `You have already reacted ${type} to this ${targetType}.`;

    return message;
  }

  //* Delete reaction if toggling off
  if (existReaction && !type) {
    await Reaction.findByIdAndDelete(existReaction._id);
    message = `Your reaction has been removed from this ${targetType}.`;

    return message;
  }

  // update or create reaction
  await Reaction.findOneAndUpdate(
    {
      targetId,
      targetType,
      userId,
    },
    {
      ...payload,
      userId,
    },
    {
      new: true,
      upsert: true,
    },
  )
    .select('type')
    .lean();

  message = `You have reacted ${type} to this ${targetType}.`;

  return message;
};

const getReactions = async (query: TReactionQuery) => {
  const { targetType, targetId, limit, page, sort, type } = query;

  const skip = (page - 1) * limit;

  const reactionsAggregate = await Reaction.aggregate([
    {
      $match: {
        targetType,
        targetId,
      },
    },
    ...(type ? [{ $match: { type } }] : []),
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { 'user.status': USER_STATUS.ACTIVE } },
    {
      $lookup: {
        from: 'profiles',
        localField: 'userId',
        foreignField: 'userId',
        as: 'profile',
      },
    },
    { $unwind: '$profile' },
    {
      $project: {
        _id: 1,
        // targetType: 1,
        // targetId: 1,
        type: 1,
        createdAt: 1,
        'profile.userId': 1,
        'profile.fullName': 1,
        'profile.profilePhoto': 1,
      },
    },
    {
      $facet: {
        reactions: [
          { $sort: { createdAt: sort } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const reactions = reactionsAggregate[0]?.reactions;
  const total = reactionsAggregate[0]?.totalCount[0]?.count ?? 0;

  const totalPages = Math.ceil(total / limit);

  // If there are no results, allow only page 1 to be valid
  if (totalPages > 0 && page > totalPages) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The requested page number does not exist. Please check the pagination parameters.',
    );
  }
  if (totalPages === 0 && page > 1) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No results found. The requested page number does not exist.',
    );
  }

  const pagination: TPagination = {
    totalPages,
    totalItems: total,
    currentPage: page,
    itemsPerPage: limit,
  };

  return {
    reactions,
    pagination,
  };
};

type TTypeGroup = {
  type: string;
  count: number;
};

const getTotalReactions = async (
  targetType: string,
  targetId: Types.ObjectId,
) => {
  const result = await Reaction.aggregate([
    { $match: { targetType, targetId: new Types.ObjectId(targetId) } },
    {
      $facet: {
        groupedCounts: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          {
            $project: {
              _id: 0,
              type: '$_id',
              count: 1,
            },
          },
        ],
        totalCount: [{ $count: 'total' }],
      },
    },
  ]);

  const grouped: TTypeGroup[] = result[0].groupedCounts;
  const total = result[0].totalCount[0]?.total ?? 0;

  // Append total to the same array
  grouped.push({ type: 'total', count: total });

  // Sort by count in descending order
  grouped.sort((a, b) => b.count - a.count);

  const lastReactionsName = await Reaction.aggregate([
    { $match: { targetType, targetId: new Types.ObjectId(targetId) } },
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'profiles',
        localField: 'userId',
        foreignField: '_id',
        as: 'profile',
      },
    },
    { $unwind: '$profile' },
    {
      $project: {
        fullName: '$profile.fullName',
      },
    },
  ]);

  const fullName = lastReactionsName[0]?.fullName;

  return {
    grouped,
    fullName,
    total,
  };
};

export const ReactionServices = {
  toggleReaction,
  getReactions,
  getTotalReactions,
};
