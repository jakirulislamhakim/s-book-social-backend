import { TFriendPaginationQuery, TFriendRequestSend } from './friend.interface';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { FRIEND_STATUS } from './friend.constant';
import { Friend } from './friend.model';
import { User } from '../User/user.model';
import { USER_STATUS } from '../User/user.constant';
import { TPagination } from '../../utils/sendApiResponse';
import { Profile } from '../Profile/profile.model';
import { NotificationUtils } from '../Notification/notification.utils';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from '../Notification/notification.constant';
import { UserBlockUtils } from '../Block/block.utils';

const sendFriendRequest = async (
  senderId: Types.ObjectId,
  { receiverId }: TFriendRequestSend,
) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not send friend request to yourself',
    );
  }

  // check if the user is blocked or not if they are blocked then throw error
  await UserBlockUtils.checkMutualBlock(
    senderId,
    new Types.ObjectId(receiverId),
  );

  const isReceiverExist = await User.findById(receiverId)
    .select('status')
    .lean();

  if (!isReceiverExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user you sent request is not found!',
    );
  }

  if (isReceiverExist.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The user you sent friend request is not active',
    );
  }

  const hasSentRequest = await Friend.exists({
    senderId: receiverId,
    receiverId: senderId,
    status: FRIEND_STATUS.PENDING,
  }).lean();

  if (hasSentRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The user has already sent you a friend request. You can accept or reject this friend request',
    );
  }

  const friendRequest = await Friend.findOne({
    senderId,
    receiverId,
  })
    .select('status')
    .lean();

  if (friendRequest?.status === FRIEND_STATUS.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already sent friend request to this user',
    );
  }

  if (friendRequest?.status === FRIEND_STATUS.ACCEPTED) {
    throw new AppError(httpStatus.CONFLICT, 'The user is already your friend');
  }

  if (friendRequest?.status === FRIEND_STATUS.REJECTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The previous friend request was rejected. Please wait for 7 days to send again friend request to this user',
    );
  }

  const sendRequest = await Friend.create({
    senderId,
    receiverId,
    status: FRIEND_STATUS.PENDING,
  });

  // send notification
  const profile = await Profile.findOne({ userId: senderId })
    .select('fullName')
    .lean();

  await NotificationUtils.createNotification({
    action: NOTIFICATION_ACTION.FRIEND_REQUEST,
    targetType: NOTIFICATION_TARGET_TYPE.FRIEND,
    senderId,
    receiverId: new Types.ObjectId(receiverId),
    targetId: sendRequest._id,
    message: `${profile?.fullName} sent you a friend request`,
    url: `/friends/requests/received`,
    url_method: NOTIFICATION_URL_METHOD.GET,
  });

  return sendRequest;
};

const acceptFriendRequest = async (
  requestId: string,
  receiverId: Types.ObjectId,
) => {
  if (requestId === receiverId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not accept friend request to yourself',
    );
  }

  const friendRequest = await Friend.findById(requestId)
    .select('status senderId receiverId')
    .lean();

  if (!friendRequest) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The friend request you want to accept is not found',
    );
  }

  // check if the user is the receiver
  if (friendRequest.receiverId.toString() !== receiverId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't accept other users friend request",
    );
  }

  if (friendRequest.status === FRIEND_STATUS.ACCEPTED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already friends');
  }

  if (friendRequest.status === FRIEND_STATUS.REJECTED) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already rejected the friend request',
    );
  }

  const acceptFriendRequest = await Friend.findByIdAndUpdate(
    requestId,
    {
      status: FRIEND_STATUS.ACCEPTED,
    },
    {
      new: true,
    },
  );

  // send notification
  const profile = await Profile.findOne({ userId: receiverId })
    .select('fullName')
    .lean();

  await NotificationUtils.createNotification({
    action: NOTIFICATION_ACTION.FRIEND_REQUEST_ACCEPTED,
    targetType: NOTIFICATION_TARGET_TYPE.FRIEND,
    senderId: receiverId,
    receiverId: friendRequest.senderId,
    targetId: friendRequest._id,
    message: `${profile?.fullName} accepted your friend request`,
    url: `/users/profile/${receiverId}`,
    url_method: NOTIFICATION_URL_METHOD.GET,
  });

  return acceptFriendRequest;
};

const rejectFriendRequest = async (
  requestId: string,
  receiverId: Types.ObjectId,
) => {
  if (requestId === receiverId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not reject friend request to yourself',
    );
  }

  const friendRequest = await Friend.findById(requestId)
    .select('status receiverId')
    .lean();

  if (!friendRequest) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The friend request you want to reject is not found',
    );
  }

  if (friendRequest.receiverId.toString() !== receiverId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't reject other users friend request",
    );
  }

  if (friendRequest.status === FRIEND_STATUS.ACCEPTED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already friends');
  }

  if (friendRequest.status === FRIEND_STATUS.REJECTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already rejected the friend request',
    );
  }

  const rejectRequest = await Friend.findByIdAndUpdate(
    requestId,
    {
      status: FRIEND_STATUS.REJECTED,
    },
    {
      new: true,
      timestamps: false,
    },
  );

  return rejectRequest;
};

const undoFriendRequest = async (
  requestId: string,
  senderId: Types.ObjectId,
) => {
  if (requestId === senderId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not undo friend request to yourself',
    );
  }

  const friendRequest = await Friend.findById(requestId)
    .select('status senderId')
    .lean();

  if (!friendRequest) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The friend request you want to undo is not found',
    );
  }

  if (friendRequest.senderId.toString() !== senderId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't undo other users friend request",
    );
  }

  if (friendRequest.status === FRIEND_STATUS.ACCEPTED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already friends');
  }

  if (friendRequest.status === FRIEND_STATUS.REJECTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The friend request is already rejected by the user',
    );
  }

  const undoRequest = await Friend.findByIdAndDelete(requestId);

  return undoRequest;
};

const getMyReceivedFriendRequests = async (
  receiverId: Types.ObjectId,
  query: TFriendPaginationQuery,
) => {
  const { page, limit, sort } = query;
  const skip = (page - 1) * limit;

  const results = await Friend.aggregate([
    {
      $match: {
        receiverId: receiverId,
        status: 'pending',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'senderId',
        foreignField: '_id',
        as: 'senderUser',
      },
    },
    { $unwind: '$senderUser' },
    { $match: { 'senderUser.status': 'active' } },
    {
      $lookup: {
        from: 'profiles',
        localField: 'senderId',
        foreignField: 'userId',
        as: 'senderProfile',
      },
    },
    { $unwind: '$senderProfile' },
    {
      $project: {
        _id: 1,
        status: 1,
        sender: {
          userId: '$senderUser._id',
          fullName: '$senderProfile.fullName',
          profilePhoto: '$senderProfile.profilePhoto',
        },
        requestedAt: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [
          { $sort: { requestedAt: sort } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const receivedFriendRequests = results[0].paginatedResults;
  const totalCount = results[0].totalCount[0]?.count ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

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
    currentPage: page,
    itemsPerPage: limit,
    totalItems: totalCount,
    totalPages,
  };

  return {
    receivedFriendRequests,
    pagination,
  };
};

const getMySentFriendRequests = async (
  senderId: Types.ObjectId,
  query: TFriendPaginationQuery,
) => {
  const { page, limit, sort } = query;
  const skip = (page - 1) * limit;

  const result = await Friend.aggregate([
    {
      $match: {
        senderId: senderId,
        status: 'pending',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'receiverId',
        foreignField: '_id',
        as: 'receiverUser',
      },
    },
    { $unwind: '$receiverUser' },
    { $match: { 'receiverUser.status': 'active' } },
    {
      $lookup: {
        from: 'profiles',
        localField: 'receiverId',
        foreignField: 'userId',
        as: 'receiverProfile',
      },
    },
    { $unwind: '$receiverProfile' },
    {
      $project: {
        _id: 1,
        status: 1,
        receiver: {
          userId: '$receiverUser._id',
          fullName: '$receiverProfile.fullName',
          profilePhoto: '$receiverProfile.profilePhoto',
        },
        requestedAt: 1,
      },
    },
    {
      $facet: {
        paginatedResults: [
          { $sort: { requestedAt: sort } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const sentFriendRequests = result[0].paginatedResults;
  const totalCount = result[0].totalCount[0]?.count ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

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
    currentPage: page,
    itemsPerPage: limit,
    totalItems: totalCount,
    totalPages,
  };

  return {
    sentFriendRequests,
    pagination,
  };
};

const getMyFriends = async (
  userId: Types.ObjectId,
  query: TFriendPaginationQuery,
) => {
  const { page, limit, sort } = query;
  const skip = (page - 1) * limit;

  const result = await Friend.aggregate([
    {
      $match: {
        status: FRIEND_STATUS.ACCEPTED,
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
    },

    // Add a computed field: otherUserId
    {
      $addFields: {
        otherUserId: {
          $cond: {
            if: { $eq: ['$senderId', userId] },
            then: '$receiverId',
            else: '$senderId',
          },
        },
      },
    },

    // Lookup user data for other user
    {
      $lookup: {
        from: 'users',
        localField: 'otherUserId',
        foreignField: '_id',
        as: 'otherUser',
      },
    },
    { $unwind: '$otherUser' },

    { $match: { 'otherUser.status': USER_STATUS.ACTIVE } },

    // Lookup profile data for other user
    {
      $lookup: {
        from: 'profiles',
        localField: 'otherUserId',
        foreignField: 'userId',
        as: 'otherProfile',
      },
    },
    { $unwind: '$otherProfile' },

    {
      $project: {
        _id: 1,
        status: 1,
        isSender: { $eq: ['$senderId', userId] },
        profile: {
          userId: '$otherUser._id',
          fullName: '$otherProfile.fullName',
          profilePhoto: '$otherProfile.profilePhoto',
        },
        updatedAt: 1,
      },
    },

    // Facet pagination & separate data after pagination
    {
      $facet: {
        paginatedResults: [
          { $sort: { updatedAt: sort } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const friends = result[0].paginatedResults;

  const totalCount = result[0].totalCount[0]?.count ?? 0;

  const totalPages = Math.ceil(totalCount / limit);

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
    currentPage: query.page,
    itemsPerPage: query.limit,
    totalItems: totalCount,
    totalPages,
  };

  return {
    friends,
    pagination,
  };
};

const deleteFriendByUserId = async (
  currentUserId: Types.ObjectId,
  friendUserId: string,
) => {
  if (currentUserId.toString() === friendUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You cannot delete yourself');
  }

  const hasFriend = await Friend.findOne({
    $or: [
      { senderId: currentUserId, receiverId: friendUserId },
      { senderId: friendUserId, receiverId: currentUserId },
    ],
  })
    .select('_id status')
    .lean();

  if (!hasFriend) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user you want to delete from your friend list is not found',
    );
  }

  if (hasFriend.status !== FRIEND_STATUS.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The user you want to delete from your friend list is not your friend',
    );
  }

  await Friend.findByIdAndDelete(hasFriend._id);

  const profile = await Profile.findOne({ userId: friendUserId })
    .select('fullName')
    .lean();

  const fullName = profile!.fullName;

  return fullName;
};

export const FriendServices = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  undoFriendRequest,
  getMyReceivedFriendRequests,
  getMySentFriendRequests,
  getMyFriends,
  deleteFriendByUserId,
};
