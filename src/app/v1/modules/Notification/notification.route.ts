import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { ParamsValidations } from '../../validation/params.validation';
import { USER_ROLE } from '../User/user.constant';
import { NotificationController } from './notification.controller';
import { NotificationValidation } from './notification.validation';

const router = Router();

router.get(
  '/',
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.getNotifications,
);

router.patch(
  '/:id/read',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.markAsRead,
);

router.patch(
  '/read-all',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.markAllAsRead,
);

router.delete(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.deleteNotification,
);

router.get(
  '/count-unread',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.unreadNotificationCount,
);

router.post(
  '/broadcast',
  validateReq.body(NotificationValidation.broadcastNotificationSchema),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.broadcastNotification,
);

export const NotificationRoutes = router;
