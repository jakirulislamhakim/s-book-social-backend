import { Router } from 'express';
import { authMiddleware, validateReq } from '../../middlewares';
import { PostAppealValidations } from './postAppeal.validation';
import { USER_ROLE } from '../User/user.constant';
import { PostAppealControllers } from './postAppeal.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  validateReq.body(PostAppealValidations.createPostAppealSchema),
  authMiddleware(USER_ROLE.USER),
  PostAppealControllers.createPostAppeal,
);

router.get(
  '/',
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authMiddleware(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostAppealControllers.getAllPostAppeals,
);

export const PostAppealRoutes = router;
