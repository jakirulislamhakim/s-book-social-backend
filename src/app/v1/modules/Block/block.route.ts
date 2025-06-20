import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { UserBlockValidations } from './block.validation';
import { USER_ROLE } from '../User/user.constant';
import { UserBlockControllers } from './block.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  validateReq.body(UserBlockValidations.createUserBlock),
  authorizeRoles(USER_ROLE.USER),
  UserBlockControllers.userBlock,
);

router.delete(
  '/:blockedId',
  validateReq.pathParams(
    ParamsValidations.pathParamObjectIDSchema('blockedId'),
  ),
  authorizeRoles(USER_ROLE.USER),
  UserBlockControllers.userUnBlock,
);

router.get(
  '/lists',
  authorizeRoles(USER_ROLE.USER),
  UserBlockControllers.getMyAllBlockedUsers,
);

export const UserBlockRoutes = router;
