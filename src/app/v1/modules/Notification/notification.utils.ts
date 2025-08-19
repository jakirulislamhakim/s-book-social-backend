import { TNotificationCreate } from './notification.interface';
import { Notification } from './notification.model';

const createNotification = async (
  payload: TNotificationCreate | TNotificationCreate[],
) => {
  return await Notification.create(payload);
};

export const NotificationUtils = {
  createNotification,
};
