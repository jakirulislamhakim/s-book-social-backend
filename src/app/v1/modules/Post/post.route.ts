import { Router } from 'express';
import { PostControllers } from './post.controller';
import {
  authorizeRoles,
  parseFormDataToJSONMiddleware,
  validateReq,
} from '../../middlewares';
import { PostValidations } from './post.validation';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../config/multer.config';
import { ParamsValidations } from '../../validation/params.validation';
import { PostAppealValidations } from '../PostAppeal/postAppeal.validation';

const router = Router();

router.post(
  '/',
  upload.array('media', 10),
  parseFormDataToJSONMiddleware,
  validateReq.body(PostValidations.createPostSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.createPost,
);

router.get(
  '/me',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.getMyPosts,
);

router.get(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.getPostById,
);

router.patch(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(PostValidations.updatePostSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.updatePostById,
);

router.delete(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.deletePostById,
);

router.get(
  '/users/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.getOtherUserPosts,
);

// admin routes 🔻
router.patch(
  '/:id/remove',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(PostValidations.removePostSchema),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.removePostByAdmin,
);

router.patch(
  '/:id/restore',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(PostAppealValidations.appealAdminResponseSchema),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.restorePostByAdmin,
);

router.patch(
  '/:id/reject',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(PostAppealValidations.appealAdminResponseSchema),
  authorizeRoles(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.rejectPostAppealByAdmin,
);

export const PostRoutes = router;
