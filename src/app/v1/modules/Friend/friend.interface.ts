import { Types } from 'mongoose';
import { FRIEND_STATUS } from './friend.constant';
import { z } from 'zod';
import { FriendshipValidations } from './friend.validation';

type TFriendStatus = (typeof FRIEND_STATUS)[keyof typeof FRIEND_STATUS];

export type TFriend = {
  _id?: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: TFriendStatus;
  requestedAt: Date;
  updatedAt: Date;
};

export type TFriendRequestSend = z.infer<
  typeof FriendshipValidations.createFriendshipSchema
>;
// Basic friend request metadata (shared)
type TFriendRequestBaseResponse = {
  _id: string;
  status: TFriendStatus;
  requestedAt: Date;
};

// Shared user info for sender/receiver
type TUserSummaryResponse = {
  _id: string;
  userId: string;
  fullName: string;
  profilePhoto: string;
};

// Friend request received by the current user (has sender info)
export type TFriendRequestReceived = TFriendRequestBaseResponse & {
  senderId: TUserSummaryResponse;
};

// Friend request sent by the current user (has receiver info)
export type FriendRequestSent = TFriendRequestBaseResponse & {
  receiverId: TUserSummaryResponse;
};

export type TFriendPaginationQuery = z.infer<
  typeof FriendshipValidations.paginationQuerySchema
>;
