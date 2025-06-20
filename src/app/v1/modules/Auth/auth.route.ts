import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';
import { USER_ROLE } from '../User/user.constant';
import { authorizeRoles, validateReq } from '../../middlewares';

const router = Router();

router.post(
  '/registration',
  validateReq.body(AuthValidations.userRegistrationSchema),
  AuthControllers.userRegistration,
);

router.post(
  '/login',
  validateReq.body(AuthValidations.loginSchema),
  AuthControllers.login,
);

router.get('/verify-email/:token', AuthControllers.verifyEmail);

router.post(
  '/resend-verification',
  validateReq.body(AuthValidations.resendVerificationEmailSchema),
  AuthControllers.resendVerificationEmail,
);

router.post(
  '/change-password',
  validateReq.body(AuthValidations.changePasswordSchema),
  authorizeRoles(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  AuthControllers.changePassword,
);

router.post(
  '/forget-password',
  validateReq.body(AuthValidations.forgetPasswordSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password/:token',
  validateReq.body(AuthValidations.resetPasswordSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/refresh',
  validateReq.cookies(AuthValidations.refreshTokenSchema),
  AuthControllers.refreshToken,
);

router.post(
  '/admin-registration',
  validateReq.body(AuthValidations.userRegistrationSchema),
  authorizeRoles(USER_ROLE.SUPER_ADMIN),
  AuthControllers.createAdminBySuperAdmin,
);

router.patch(
  '/change-role',
  validateReq.body(AuthValidations.changeUserRoleSchema),
  authorizeRoles(USER_ROLE.SUPER_ADMIN),
  AuthControllers.changeUserRole,
);

export const AuthRoutes = router;
