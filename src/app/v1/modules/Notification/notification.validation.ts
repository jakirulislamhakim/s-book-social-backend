import { z } from 'zod';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from './notification.constant';

const broadcastNotificationSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required!',
    })
    .min(5, 'Notification message should be at least 5 characters long')
    .max(500, 'Notification message should not exceed 500 characters'),

  action: z.enum(
    [NOTIFICATION_ACTION.SYSTEM_ALERT, NOTIFICATION_ACTION.SYSTEM_INFO],
    {
      required_error: 'Action is required!',
      invalid_type_error: `Action must be ${Object.values(NOTIFICATION_ACTION).join(' or ')}`,
    },
  ),

  targetType: z.enum(
    [NOTIFICATION_TARGET_TYPE.SYSTEM, NOTIFICATION_TARGET_TYPE.SECURITY],
    {
      required_error: 'Target type is required!',
      invalid_type_error: `Target type must be ${Object.values(NOTIFICATION_TARGET_TYPE).join(' or ')}`,
    },
  ),

  url: z.string().optional(),

  url_method: z
    .enum(
      [
        NOTIFICATION_URL_METHOD.POST,
        NOTIFICATION_URL_METHOD.GET,
        NOTIFICATION_URL_METHOD.PUT,
        NOTIFICATION_URL_METHOD.PATCH,
        NOTIFICATION_URL_METHOD.DELETE,
      ],
      {
        invalid_type_error: `URL method must be ${Object.values(NOTIFICATION_URL_METHOD).join(' or ')}`,
      },
    )
    .optional(),
});

export const NotificationValidation = {
  broadcastNotificationSchema,
};
