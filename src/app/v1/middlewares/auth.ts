import { AuthUtils } from './../modules/Auth/auth.utils';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { User } from '../modules/User/user.model';
import { TUserRole } from '../modules/User/user.interface';
import { USER_STATUS } from '../modules/User/user.constant';

export const authMiddleware = (...requiredRole: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token?.startsWith('Bearer ')) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Access token is required start with Bearer token!',
      );
    }

    const [, accessToken] = token.split(' ');

    const decoded = AuthUtils.decodedAccessToken(accessToken);

    const { email, role } = decoded;

    // check required role is match with jwt decoded role
    const matchRole = requiredRole.includes(role);
    if (!matchRole)
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You have no access to this route!',
      );

    // check if the user exists on db
    const user = await User.findOne({ email, role });

    if (!user) {
      throw new AppError(401, `The ${role} is not found.`);
    }
    if (!user.isVerified) {
      throw new AppError(
        403,
        'Account is not verified. Please verify your email.',
      );
    }
    if (user.status !== USER_STATUS.ACTIVE)
      throw new AppError(403, 'Account is not active.');

    if (user.passwordChangeAt > new Date(decoded.iat * 1000)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Access token is expired! Please login again.',
      );
    }

    // attach user info in request
    req.user = user;

    next();
  });
};
