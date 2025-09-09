import { Router } from 'express';
import { UserController } from './user.controller';
import { USER_ROLE } from './user.constant';
import { validateReq } from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { authorizeRoles } from '../../middlewares';
import { ParamsValidations } from '../../validation/params.validation';
import { AuthValidations } from '../Auth/auth.validation';

const router = Router();

router.get(
  '/',
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.getAllUsers,
);

router.get(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.getUserById,
);

router.patch(
  '/username',
  validateReq.body(UserValidations.usernameSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.updateUserUsername,
);

router.patch(
  '/me/deactivate',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserController.deactivateUser,
);

router.patch(
  '/me/soft-delete',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserController.softDeleteUser,
);

router.patch(
  '/me/reactive',
  validateReq.body(AuthValidations.loginSchema),
  UserController.reactiveUser,
);

// ⚠️ admin and super admin
router.patch(
  '/:id/suspend',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(UserValidations.suspendUserSchema),
  authorizeRoles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  UserController.suspendUser,
);

router.patch(
  '/:id/restore',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  UserController.restoreSuspendUser,
);

export const UserRoutes = router;
