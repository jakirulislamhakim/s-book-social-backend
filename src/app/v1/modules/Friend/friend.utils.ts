import { Types } from 'mongoose';
import { FRIEND_STATUS } from './friend.constant';
import { Friend } from './friend.model';

const getFriendsAndFollowingIds = async (currentUserId: Types.ObjectId) => {
  const [sentFriendIds, receivedFriendIds, followingIds] = await Promise.all([
    Friend.distinct('receiverId', {
      senderId: currentUserId,
      status: FRIEND_STATUS.ACCEPTED,
    }),
    Friend.distinct('senderId', {
      receiverId: currentUserId,
      status: FRIEND_STATUS.ACCEPTED,
    }),
    Friend.distinct('receiverId', {
      senderId: currentUserId,
      status: FRIEND_STATUS.PENDING,
    }),
  ]);

  return {
    friendIds: [...sentFriendIds, ...receivedFriendIds],
    followingIds,
  };
};

export const FriendUtils = {
  getFriendsAndFollowingIds,
};
