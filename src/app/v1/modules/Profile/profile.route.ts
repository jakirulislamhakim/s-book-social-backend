import { Router } from 'express';
import {
  authMiddleware,
  parseFormDataToJSONMiddleware,
  validateReq,
} from '../../middlewares';
import { USER_ROLE } from '../User/user.constant';
import { ProfileControllers } from './profile.controller';
import { ProfileValidations } from './profile.validation';
import { upload } from '../../config/multer.config';

const router = Router();

router.get(
  '/me',
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
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
  authMiddleware(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ProfileControllers.updateMyProfile,
);

export const ProfileRoutes = router;
