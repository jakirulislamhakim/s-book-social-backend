import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { FriendshipValidations } from './friend.validation';
import { USER_ROLE } from '../User/user.constant';
import { FriendControllers } from './friend.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/requests',
  validateReq.body(FriendshipValidations.createFriendshipSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.sendFriendRequest,
);

router.patch(
  '/requests/:id/accept',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.acceptFriendRequest,
);

router.patch(
  '/requests/:id/reject',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.rejectFriendRequest,
);

router.delete(
  '/requests/:id/undo',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.undoFriendRequest,
);

router.get(
  '/requests/received',
  validateReq.queryParams(FriendshipValidations.paginationQuerySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.getMyReceivedFriendRequests,
);

router.get(
  '/requests/sent',
  validateReq.queryParams(FriendshipValidations.paginationQuerySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.getMySentFriendRequests,
);

router.get(
  '/',
  validateReq.queryParams(FriendshipValidations.paginationQuerySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.getMyFriends,
);

router.delete(
  '/:userId',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema('userId')),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  FriendControllers.deleteFriendByUserId,
);

export const FriendRoutes = router;
