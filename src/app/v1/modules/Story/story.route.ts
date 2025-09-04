import { Router } from 'express';
import { upload } from '../../config/multer.config';
import {
  authorizeRoles,
  parseFormDataToJSONMiddleware,
  validateReq,
} from '../../middlewares';
import { StoryValidations } from './story.validation';
import { USER_ROLE } from '../User/user.constant';
import { StoryController } from './story.controller';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.post(
  '/',
  upload.single('image'),
  parseFormDataToJSONMiddleware,
  validateReq.body(StoryValidations.createStorySchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.createStory,
);

router.get(
  '/archive',
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.getArchiveStories,
);

router.get(
  '/user/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.getActiveStoryByUserId,
);

router.put(
  '/:id/view',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.createStoryView,
);

router.patch(
  '/:id/reaction',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  validateReq.body(StoryValidations.storyReactionSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.reactingInStory,
);

router.get(
  '/:id/views',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.getStoryViews,
);

router.get(
  '/feed',
  validateReq.queryParams(ParamsValidations.queryParamsSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.getStoriesForFeed,
);

router.get(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.getStoryById,
);

router.delete(
  '/:id',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema()),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  StoryController.deleteStoryById,
);

export const StoryRoutes = router;
