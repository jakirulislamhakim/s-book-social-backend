import { Types } from 'mongoose';
import { UserBlock } from './block.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

type TObjId = Types.ObjectId;

const checkMutualBlock = async (
  currentUserId: TObjId,
  anotherUserId: TObjId,
): Promise<void> => {
  const blockedUser = await UserBlock.findOne({
    $or: [
      { blockerId: currentUserId, blockedId: anotherUserId },
      { blockerId: anotherUserId, blockedId: currentUserId },
    ],
  })
    .select('blockerId')
    .lean();

  const errMsg =
    blockedUser && blockedUser.blockerId.equals(currentUserId)
      ? 'You blocked the user.'
      : 'The user blocked you.';

  if (blockedUser) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `${errMsg} You will not be able to take any action with each other.`,
    );
  }
};

const getExcludedUserIds = async (currentUserId: TObjId): Promise<TObjId[]> => {
  const blockedByMe = await UserBlock.distinct('blockedId', {
    blockerId: currentUserId,
  });

  const blockedMe = await UserBlock.distinct('blockerId', {
    blockedId: currentUserId,
  });

  return [...blockedByMe, ...blockedMe];
};

export const UserBlockUtils = {
  checkMutualBlock,
  getExcludedUserIds,
};
