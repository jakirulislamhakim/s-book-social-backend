import { Router } from 'express';
import { UserController } from './user.controller';
import { USER_ROLE } from './user.constant';
import { validateReq } from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { authMiddleware } from '../../middlewares';

const router = Router();

router.post(
  '/change-role/:user_id',
  validateReq.body(UserValidations.changeUserRoleSchema),
  authMiddleware(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.changeUserRole,
);

export const UserRoutes = router;
