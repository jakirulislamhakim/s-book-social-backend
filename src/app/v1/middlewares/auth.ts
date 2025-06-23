import { AuthUtils } from './../modules/Auth/auth.utils';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { User } from '../modules/User/user.model';
import { TUserRole } from '../modules/User/user.interface';
import { USER_STATUS } from '../modules/User/user.constant';

export const authorizeRoles = (...requiredRoles: TUserRole[]) => {
  if (requiredRoles.length === 0) {
    throw new Error(
      '⚠ At least one role is required to use this Authorization Middleware. ⚠',
    );
  }

  if (new Set(requiredRoles).size !== requiredRoles.length) {
    throw new Error(
      '⚠ Duplicate roles are not allowed in Authorization Middleware. ⚠',
    );
  }

  return catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Authorization header is missing. Please include a Bearer token.',
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Malformed authorization header. Expected format: "Bearer <token>".',
      );
    }

    const [, accessToken] = authHeader.split(' ');

    const decoded = AuthUtils.decodedAccessToken(accessToken);

    const { email, role } = decoded;

    // check required role is match with jwt decoded role
    if (!requiredRoles.includes(role))
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${role}`,
      );

    // check if the user exists on db
    const user = await User.findOne({ email, role }).lean();

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `Invalid token. User with email "${email}" and role "${role}" not found.`,
      );
    }
    if (!user.isVerified) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account is not verified. Please verify your email to continue.',
      );
    }
    if (user.status !== USER_STATUS.ACTIVE)
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Account is currently ${user.status.toLowerCase()}. Please restore your account or contact support.`,
      );

    if (user.passwordChangeAt > new Date(decoded.iat * 1000)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Access token is no longer valid. Password was changed after token was issued. Please log in again.',
      );
    }

    // attach user info in request
    req.user = user;

    next();
  });
};
