import { Types } from 'mongoose';
import { Notification } from './notification.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TNotificationBroadcast } from './notification.interface';
import { User } from '../User/user.model';
import { UserBlockUtils } from '../Block/block.utils';

const getNotifications = async (
  userId: Types.ObjectId,
  query: Record<string, unknown>,
) => {
  const excludeSenderIds = await UserBlockUtils.getExcludedUserIds(userId);

  const notificationsQuery = new QueryBuilder(
    Notification.find({
      receiverId: userId,
      senderId: { $nin: excludeSenderIds },
    }),
    query,
  )
    .fields()
    .sort()
    .paginate();

  const notifications = await notificationsQuery.modelQuery.lean();
  const pagination = await notificationsQuery.paginateMeta();

  return {
    notifications,
    pagination,
  };
};

const markAsRead = async (notificationId: string, userId: Types.ObjectId) => {
  const notification = await Notification.findById(notificationId)
    .select('receiverId')
    .lean();

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'The notification is not found!');
  }

  if (!userId.equals(notification.receiverId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to mark this notification as read.',
    );
  }

  const updatedNotification = await Notification.findOneAndUpdate(
    { _id: notificationId, receiverId: userId },
    {
      isRead: true,
    },
    {
      new: true,
    },
  ).lean();

  return updatedNotification;
};

const markAllAsRead = async (userId: Types.ObjectId) => {
  const notification = await Notification.updateMany(
    { receiverId: userId, isRead: false },
    { isRead: true },
    {
      new: true,
    },
  );

  return notification.modifiedCount;
};

const deleteNotification = async (
  notificationId: string,
  userId: Types.ObjectId,
) => {
  const notification = await Notification.findById(notificationId)
    .select('receiverId')
    .lean();

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'The notification is not found!');
  }

  if (!userId.equals(notification.receiverId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this notification.',
    );
  }

  const deletedNotification = await Notification.findOneAndDelete({
    _id: notificationId,
    receiverId: userId,
  }).lean();

  return deletedNotification;
};

const unreadNotificationCount = async (userId: Types.ObjectId) => {
  const count = await Notification.countDocuments({
    receiverId: userId,
    isRead: false,
  });

  return count;
};

const broadcastNotification = async (
  userId: Types.ObjectId,
  payload: TNotificationBroadcast,
) => {
  //! warn : this will send notification to all user but it is not good idea for large scale application ..
  //! best practice is to send notification by socket or background job worker

  const users = await User.find({}).select('_id').lean();

  const notifications = users.map((user) => ({
    ...payload,
    receiverId: user._id,
    senderId: userId,
    isFromSystem: true,
  }));

  await Notification.insertMany(notifications);
};

export const NotificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  unreadNotificationCount,
  broadcastNotification,
};
