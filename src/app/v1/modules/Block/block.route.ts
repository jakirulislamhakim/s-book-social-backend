import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { UserBlockValidations } from './block.validation';
import { USER_ROLE } from '../User/user.constant';
import { UserBlockControllers } from './block.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/block',
  validateReq.body(UserBlockValidations.createUserBlock),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserBlockControllers.userBlock,
);

router.delete(
  '/:userId/unblock',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema('userId')),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserBlockControllers.userUnBlock,
);

router.get(
  '/blocked/lists',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserBlockControllers.getMyAllBlockedUsers,
);

export const UserBlockRoutes = router;
