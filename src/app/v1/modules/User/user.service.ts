import { AuthUtils } from './../Auth/auth.utils';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TUserSuspend, TUser } from './user.interface';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  USER_SEARCHABLE_FIELDS,
  USER_ROLE,
  USER_STATUS,
} from './user.constant';
import { Types } from 'mongoose';
import { TUserLogin } from '../Auth/auth.interface';
import { Profile } from '../Profile/profile.model';
import { FriendUtils } from '../Friend/friend.utils';

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(USER_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const user = await userQuery.modelQuery.lean();
  const pagination = await userQuery.paginateMeta();

  return {
    user,
    pagination,
  };
};

const getUserByIdFromDB = async (id: string) => {
  const user = await User.findById(id).lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  return user;
};

const findMentionableFriends = async (
  currentUserId: Types.ObjectId,
  query: Record<string, unknown>,
) => {
  const { friendIds } =
    await FriendUtils.getFriendsAndFollowingIds(currentUserId);

  // const mentionsUserQuery = new QueryBuilder(
  //   Profile.find({
  //     _id: { $ne: currentUserId },
  //     userId: { $in: friends },
  //   }).select('-_id userId fullName profilePhoto'),
  //   query,
  // )
  //   .search(['fullName'])
  //   .fields()
  //   .filter()
  //   .sort()
  //   .paginate();

  // const mentionUsers = await mentionsUserQuery.modelQuery;
  // const pagination = await mentionsUserQuery.paginateMeta();

  // return {
  //   mentionUsers,
  //   pagination,
  // };

  const mentionFriends = await Profile.aggregate([
    {
      $match: {
        _id: { $ne: currentUserId },
        userId: { $in: friendIds },
        fullName: { $regex: query.fullName ?? '', $options: 'i' },
      },
    },
    {
      $sort: {
        fullName: 1,
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        fullName: 1,
        profilePhoto: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $match: {
        'user.status': USER_STATUS.ACTIVE,
      },
    },
    {
      $project: {
        _id: 0,
        username: '$user.username',
        userId: '$user._id',
        fullName: 1,
        profilePhoto: 1,
      },
    },
  ]);

  return mentionFriends;
};

const updateUserUsernameIntoDB = async (
  id: Types.ObjectId,
  payload: Pick<TUser, 'username'>,
) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  return result;
};

const deactivateUserIntoDB = async (id: Types.ObjectId) => {
  const result = await User.findByIdAndUpdate(
    id,
    { status: USER_STATUS.DEACTIVATED },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  return result;
};

const softDeleteUserIntoDB = async (id: Types.ObjectId) => {
  const result = await User.findByIdAndUpdate(
    id,
    { status: USER_STATUS.SOFT_DELETED, deletedAt: new Date() },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  return result;
};

const reactiveUserIntoDB = async (payload: TUserLogin) => {
  const { identifier, password } = payload;
  // check user exists
  const isExistsUser = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })
    .select('+password')
    .select('password role email isVerified status')
    .lean();

  if (!isExistsUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid username or email.');
  }

  // check valid password
  const matchPassword = await AuthUtils.bcryptComparePassword(
    password,
    isExistsUser.password,
  );

  if (!matchPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password is incorrect!');
  }

  await User.findOneAndUpdate(
    {
      $or: [{ email: identifier }, { username: identifier }],
    },
    {
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
    },
    {
      timestamps: false,
    },
  ).lean();
};

const suspendUserIntoDB = async (
  userId: string,
  { suspensionReason }: TUserSuspend,
) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The user is already suspended');
  }

  if (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You can't suspend an admin");
  }

  const result = await User.findByIdAndUpdate(
    userId,
    {
      status: USER_STATUS.SUSPENDED,
      suspensionReason,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  return result;
};

const restoreSuspendUserIntoDB = async (id: string) => {
  const user = await User.findById(id).select('status').lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  if (user.status === USER_STATUS.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The user is not suspended');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { status: USER_STATUS.ACTIVE, suspensionReason: '' },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  return result;
};

export const UserServices = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  findMentionableFriends,
  updateUserUsernameIntoDB,
  deactivateUserIntoDB,
  softDeleteUserIntoDB,
  reactiveUserIntoDB,
  suspendUserIntoDB,
  restoreSuspendUserIntoDB,
};
