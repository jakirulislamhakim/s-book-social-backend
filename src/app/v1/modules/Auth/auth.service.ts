import { AuthUtils } from './auth.utils';
import httpStatus from 'http-status';
import { User } from '../User/user.model';
import type {
  TChangePassword,
  TChangeUserRole,
  TJwtPayload,
  TLoginUser,
  TRegisterUser,
} from './auth.interface';

import AppError from '../../errors/AppError';
import { UserUtils } from '../User/user.util';
import config from '../../config';
import { sendEmailBySendGrid } from '../../utils/sendEmailSendGrid';
import { Profile } from '../Profile/profile.model';
import mongoose from 'mongoose';
import { ADMIN_BADGE, USER_ROLE, USER_STATUS } from '../User/user.constant';

const {
  bcryptComparePassword,
  bcryptHashPassword,
  createJwtAccessToken,
  createJwtRefreshToken,
  createJwtResetToken,
  createJwtVerifyToken,
  decodedRefreshToken,
  decodedResetToken,
  decodedVerifyToken,
} = AuthUtils;

// user registration
const userRegistrationIntoDB = async (payload: TRegisterUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password, email, ...remainingPayload } = payload;

    // Check if user already exists
    const isExistsUser = await User.findOne({ email }).session(session);
    if (isExistsUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        `A user with this email already exists.`,
      );
    }

    // Hash password and generate username
    const hashPassword = await bcryptHashPassword(password);
    const username = await UserUtils.generateUniqueUsername(payload.fullName);

    // Create User
    const user = await User.create(
      [
        {
          password: hashPassword,
          email,
          username,
        },
      ],
      { session },
    );

    // Create Profile
    const profile = await Profile.create(
      [
        {
          userId: user[0]._id,
          ...remainingPayload,
        },
      ],
      { session },
    );

    const verifyToken = createJwtVerifyToken({
      email: user[0].email,
      role: user[0].role,
    });

    const verificationLink = `${config.API_BASE_URL}/auth/verify-email/${verifyToken}`;

    await sendEmailBySendGrid({
      to: user[0].email,
      subject: 'Verify Your Email',
      templateName: 'verify-email',
      emailData: {
        verificationLink,
        name: profile[0].fullName,
      },
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { fullName: profile[0].fullName };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// user login
const login = async (payload: TLoginUser) => {
  const { identifier, password } = payload;
  // check user exists
  const isExistsUser = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })
    .select('+password')
    .select('password role email isVerified status');

  if (!isExistsUser) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Invalid username or email. Please check your credentials or sign up.',
    );
  }

  // Check user status
  if (isExistsUser.status === USER_STATUS.DEACTIVATED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account is deactivated. Please reactivate your account to login.',
    );
  }

  if (isExistsUser.status === USER_STATUS.SOFT_DELETED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account has been deleted. Please reactivate your account to login.',
    );
  }

  const profile = await Profile.findOne({ userId: isExistsUser._id }).select(
    'fullName',
  );

  if (!isExistsUser.isVerified) {
    const verifyToken = createJwtVerifyToken({
      email: isExistsUser.email,
      role: isExistsUser.role,
    });

    const verificationLink = `${config.API_BASE_URL}/auth/verify-email/${verifyToken}`;

    await sendEmailBySendGrid({
      to: isExistsUser.email,
      subject: 'Verify Your Email',
      templateName: 'verify-email',
      emailData: {
        verificationLink,
        name: profile!.fullName,
      },
    });

    return { fullName: profile!.fullName };
  }

  // check valid password
  const matchPassword = await bcryptComparePassword(
    password,
    isExistsUser.password,
  );

  if (!matchPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password is incorrect!');
  }

  // jwt payload
  const jwtPayload = {
    email: isExistsUser.email,
    role: isExistsUser.role,
  };

  // create jwt access token
  const accessToken = createJwtAccessToken(jwtPayload);
  // create jwt refresh token
  const refreshToken = createJwtRefreshToken(jwtPayload);

  const user = await User.findOneAndUpdate(
    {
      $or: [{ email: identifier }, { username: identifier }],
    },
    {
      $set: {
        lastLoginAt: new Date(),
      },
    },
    {
      new: true,
      select: '-passwordChangeAt -deletedAt -lastLoginAt',
      timestamps: false,
    },
  ).lean();

  return {
    accessToken,
    refreshToken,
    user: { ...user, fullName: profile!.fullName },
  };
};

const verifyEmail = async (token: string) => {
  const verifyToken = decodedVerifyToken(token);
  const { email, role } = verifyToken;

  await User.findOneAndUpdate({ email, role }, { isVerified: true });
};

const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email })
    .select('email role isVerified')
    .lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is already verified');
  }

  const verifyToken = createJwtVerifyToken({
    email: user.email,
    role: user.role,
  });

  const verificationLink = `${config.API_BASE_URL}/auth/verify-email/${verifyToken}`;

  const profile = await Profile.findOne({ userId: user._id })
    .select('fullName')
    .lean();

  await sendEmailBySendGrid({
    to: user.email,
    subject: 'Verify Your Email',
    templateName: 'verify-email',
    emailData: {
      verificationLink,
      name: profile!.fullName,
    },
  });
};

// change password
const changePasswordIntoDB = async (
  payload: TChangePassword,
  userEmail: string,
) => {
  const { oldPassword, newPassword } = payload;

  // check user exists
  const user = await User.findOne({ email: userEmail })
    .select('+password')
    .select('password')
    .lean();

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found!');
  }

  // check old password is valid
  const matchPassword = await bcryptComparePassword(oldPassword, user.password);

  if (!matchPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid old password!');
  }

  // hash new password
  const hashPassword = await bcryptHashPassword(newPassword);

  await User.findOneAndUpdate(
    { email: userEmail },
    { password: hashPassword, passwordChangeAt: new Date() },
  );
};

// forget password
const forgetPassword = async (payload: Pick<TLoginUser, 'identifier'>) => {
  const { identifier } = payload;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const jwtPayload: TJwtPayload = {
    email: user.email,
    role: user.role,
  };

  const resetToken = createJwtResetToken(jwtPayload);
  const resetUrl = `${config.API_BASE_URL}/auth/reset-password/${resetToken}`;

  const profile = await Profile.findOne({ userId: user._id })
    .select('fullName')
    .lean();

  await sendEmailBySendGrid({
    to: user.email,
    subject: 'Reset Your Password',
    templateName: 'reset-password',
    emailData: {
      resetUrl,
      name: profile!.fullName,
    },
  });
};

// reset password
const resetPasswordIntoDB = async (password: string, token: string) => {
  const decodedToken = decodedResetToken(token);

  // hash password
  const hashPassword = await bcryptHashPassword(password);

  // update user password
  await User.findOneAndUpdate(
    { email: decodedToken.email, role: decodedToken.role },
    {
      password: hashPassword,
      passwordChangeAt: new Date(),
    },
  );
};

const refreshToken = async (token: string) => {
  const { email, role } = decodedRefreshToken(token);

  const user = await User.findOne({ email, role }).lean();
  if (!user || !user.isVerified || user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid or unauthorized refresh token.',
    );
  }

  // jwt payload
  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  // create jwt access token
  const accessToken = createJwtAccessToken(jwtPayload);

  return accessToken;
};

const createAdminByAdminIntoDB = async (payload: TRegisterUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { password, email, ...remainingPayload } = payload;

    // Check if user already exists
    const isExistsUser = await User.findOne({ email }).session(session);
    if (isExistsUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        `The admin email is already exists`,
      );
    }

    const hashPassword = await bcryptHashPassword(password);
    const username = await UserUtils.generateUniqueUsername(payload.fullName);

    // Create User
    const user = await User.create(
      [
        {
          password: hashPassword,
          email,
          username,
          role: USER_ROLE.ADMIN,
          isVerified: true,
          badge: ADMIN_BADGE,
        },
      ],
      { session },
    );

    // Create Profile
    await Profile.create(
      [
        {
          userId: user[0]._id,
          ...remainingPayload,
        },
      ],
      { session },
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return user[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const changeUserRoleIntoDB = async (payload: TChangeUserRole) => {
  const { role, userId } = payload;

  const user = await User.findById(userId).select('role email').lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user is not found');
  }

  // an admin can't change own role and can't change first admin role
  if (user.email === config.SUPER_ADMIN_EMAIL) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can't change the super admin role",
    );
  }

  const result = await User.findByIdAndUpdate(
    userId,
    {
      role,
      badge: role === USER_ROLE.ADMIN ? ADMIN_BADGE : '',
      ...(role === USER_ROLE.ADMIN && { isVerified: true }), // conditionally set isVerified to true for admin
    },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

export const AuthServices = {
  userRegistrationIntoDB,
  login,
  verifyEmail,
  resendVerificationEmail,
  changePasswordIntoDB,
  forgetPassword,
  resetPasswordIntoDB,
  refreshToken,
  createAdminByAdminIntoDB,
  changeUserRoleIntoDB,
};
