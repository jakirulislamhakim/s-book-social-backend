import { Router } from 'express';
import { authMiddleware, validateReq } from '../../middlewares';
import { UserBlockValidations } from './block.validation';
import { USER_ROLE } from '../User/user.constant';
import { UserBlockControllers } from './block.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  validateReq.body(UserBlockValidations.createUserBlock),
  authMiddleware(USER_ROLE.USER),
  UserBlockControllers.userBlock,
);

router.delete(
  '/:blockedId',
  validateReq.pathParams(
    ParamsValidations.pathParamObjectIDSchema('blockedId'),
  ),
  authMiddleware(USER_ROLE.USER),
  UserBlockControllers.userUnBlock,
);

router.get(
  '/lists',
  authMiddleware(USER_ROLE.USER),
  UserBlockControllers.getMyAllBlockedUsers,
);

export const UserBlockRoutes = router;
