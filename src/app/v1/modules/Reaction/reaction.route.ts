import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { ReactionValidations } from './reaction.validation';
import { ReactionControllers } from './reaction.controller';
import { USER_ROLE } from '../User/user.constant';

const router = Router();

router.patch(
  '/',
  validateReq.body(ReactionValidations.createReactionSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ReactionControllers.toggleReaction,
);

router.get(
  '/',
  validateReq.queryParams(ReactionValidations.getReactionQuerySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ReactionControllers.getReactions,
);

router.get(
  '/counts',
  validateReq.queryParams(ReactionValidations.countsReactionsQuerySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ReactionControllers.getTotalReactions,
);

export const ReactionRoutes = router;
