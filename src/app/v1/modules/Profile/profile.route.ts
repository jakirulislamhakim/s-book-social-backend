import { Router } from 'express';
import {
  authorizeRoles,
  parseFormDataToJSONMiddleware,
  validateReq,
} from '../../middlewares';
import { USER_ROLE } from '../User/user.constant';
import { ProfileControllers } from './profile.controller';
import { ProfileValidations } from './profile.validation';
import { upload } from '../../config/multer.config';
import { ParamsValidations } from '../../validation/params.validation';

const router = Router();

router.get(
  '/me',
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ProfileControllers.getMyProfile,
);

router.patch(
  '/me',
  upload.fields([
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
  ]),
  parseFormDataToJSONMiddleware,
  validateReq.body(ProfileValidations.updateProfileSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ProfileControllers.updateMyProfile,
);

router.get(
  '/:userId',
  validateReq.pathParams(ParamsValidations.pathParamObjectIDSchema('userId')),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ProfileControllers.getProfileByUserId,
);

export const ProfileRoutes = router;
