import { model, Schema } from 'mongoose';
import { TNotification } from './notification.interface';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from './notification.constant';

const notificationSchema = new Schema<TNotification>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(NOTIFICATION_ACTION),
      required: true,
    },
    targetType: {
      type: String,
      enum: Object.values(NOTIFICATION_TARGET_TYPE),
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    isFromSystem: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: '',
    },
    url_method: {
      type: String,
      enum: Object.values(NOTIFICATION_URL_METHOD),
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

notificationSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<TNotification>(
  'Notification',
  notificationSchema,
);
