import { Types } from 'mongoose';
import { TUserBlockCreate } from './block.interface';
import { UserBlock } from './block.model';
import { User } from '../User/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Profile } from '../Profile/profile.model';

const userBlockIntoDB = async (
  blockerId: Types.ObjectId,
  payload: TUserBlockCreate,
) => {
  const { blockedId } = payload;

  if (blockerId.equals(new Types.ObjectId(blockedId))) {
    throw new AppError(httpStatus.BAD_REQUEST, "You can't block yourself ");
  }

  const isExistUser = await User.exists({ _id: blockedId });
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  const alreadyBlocked = await UserBlock.exists({
    blockerId,
    blockedId,
  });

  if (alreadyBlocked) {
    throw new AppError(httpStatus.CONFLICT, 'The user is already blocked');
  }

  const result = await UserBlock.create({
    blockerId,
    blockedId,
  });

  return result;
};

const userUnblockIntoDB = async (
  blockerId: Types.ObjectId,
  blockedId: string,
) => {
  const isExistUser = await User.exists({ _id: blockedId });

  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  const result = await UserBlock.findOneAndDelete({
    blockerId,
    blockedId,
  });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user is not exists in your block list',
    );
  }
  return result;
};

const getMyAllBlockedUsersFromDB = async (userId: Types.ObjectId) => {
  const blockLists = await UserBlock.find({ blockerId: userId })
    .select('blockedId createdAt -_id')
    .sort({ createdAt: -1 })
    .lean();

  const userIds = blockLists.map((item) => item.blockedId);

  const profiles = await Profile.find({ userId: { $in: userIds } })
    .select('fullName profilePhoto userId -_id')
    .lean();

  const result = profiles.map((profile) => {
    const matchedBlock = blockLists.find((item) =>
      item.blockedId.equals(profile.userId),
    );

    return {
      ...profile,
      createdAt: matchedBlock?.createdAt ?? null,
    };
  });

  // Sort by newest createdAt first (latest date comes first)
  const sortedResult = result
    .filter((user) => user.createdAt) // remove users with no createdAt
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );

  return sortedResult;
};

export const UserBlockServices = {
  userBlockIntoDB,
  userUnblockIntoDB,
  getMyAllBlockedUsersFromDB,
};
