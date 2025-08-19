import { Types } from 'mongoose';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from './notification.constant';
import { z } from 'zod';
import { NotificationValidation } from './notification.validation';

type TNotificationAction =
  (typeof NOTIFICATION_ACTION)[keyof typeof NOTIFICATION_ACTION];

type TNotificationTargetType =
  (typeof NOTIFICATION_TARGET_TYPE)[keyof typeof NOTIFICATION_TARGET_TYPE];

type TNotificationUrlMethod =
  (typeof NOTIFICATION_URL_METHOD)[keyof typeof NOTIFICATION_URL_METHOD];

export type TNotificationCreate = {
  senderId: Types.ObjectId | null;
  receiverId: Types.ObjectId;
  action: TNotificationAction;
  targetType: TNotificationTargetType;
  targetId: Types.ObjectId | null;
  message: string;
  isFromSystem?: boolean;
  url?: string;
  url_method?: TNotificationUrlMethod;
};

export type TNotification = {
  _id: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
} & Required<TNotificationCreate>;

export type TNotificationBroadcast = z.infer<
  typeof NotificationValidation.broadcastNotificationSchema
>;
