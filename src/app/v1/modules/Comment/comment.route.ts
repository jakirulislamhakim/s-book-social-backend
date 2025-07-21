import { Router } from 'express';
import { authorizeRoles, validateReq } from '../../middlewares';
import { CommentValidation } from './comment.validation';
import { USER_ROLE } from '../User/user.constant';
import { CommentControllers } from './comment.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  validateReq.body(CommentValidation.createCommentSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CommentControllers.createOrReplyComment,
);

router.get(
  '/post/:postId',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema('postId')),
  validateReq.queryParams(
    ParamsValidations.queryParamsSchema.pick({ sort: true }),
  ),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CommentControllers.getTopLevelComments,
);

router.get(
  '/:id/replies',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CommentControllers.getReplyComments,
);

router.patch(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(CommentValidation.updateCommentSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CommentControllers.updateComment,
);

router.delete(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CommentControllers.deleteComment,
);

export const CommentRoutes = router;
