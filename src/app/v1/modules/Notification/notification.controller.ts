import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { NotificationService } from './notification.service';

const getNotifications = catchAsync(async (req, res) => {
  const { notifications, pagination } =
    await NotificationService.getNotifications(req.user!._id, req.query);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      notifications.length > 0
        ? 'Notifications fetched successfully'
        : 'Currently you have no notifications',
    payload: notifications,
    pagination,
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const payload = await NotificationService.markAsRead(id, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The notification marked as read successfully',
    payload,
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user!._id;

  const modifiedCount = await NotificationService.markAllAsRead(userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      modifiedCount > 0
        ? 'All notification marked as read successfully'
        : 'You have no unread notification',
    payload: null,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const payload = await NotificationService.deleteNotification(id, userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The notification has been deleted successfully.',
    payload,
  });
});

const unreadNotificationCount = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  const payload = await NotificationService.unreadNotificationCount(userId);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload > 0
        ? `You have ${payload} unread notifications`
        : 'You have no unread notifications',
    payload,
  });
});

const broadcastNotification = catchAsync(async (req, res) => {
  const userId = req.user!._id;
  await NotificationService.broadcastNotification(userId, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Notification sent successfully to every users.',
    payload: null,
  });
});

export const NotificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  unreadNotificationCount,
  broadcastNotification,
};
