import { Router } from 'express';
import { PostControllers } from './post.controller';
import {
  authMiddleware,
  parseFormDataToJSONMiddleware,
  validateReq,
} from '../../middlewares';
import { PostValidations } from './post.validation';
import { USER_ROLE } from '../User/user.constant';
import { upload } from '../../config/multer.config';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  upload.array('media', 10),
  parseFormDataToJSONMiddleware,
  validateReq.body(PostValidations.createPostSchema),
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.createPost,
);

router.get(
  '/me',
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.getMyPosts,
);

router.get(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.getPostById,
);

router.get(
  '/users/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.ADMIN),
  PostControllers.getPostsByUserId,
);

export const PostRoutes = router;
