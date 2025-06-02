import { AuthServices } from './auth.service';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { AuthUtils } from './auth.utils';

const userRegistration = catchAsync(async (req, res) => {
  const { fullName } = await AuthServices.userRegistrationIntoDB(req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: `Welcome ${fullName}! Please check your email to verify your account`,
    payload: null,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.login(req.body);

  let message = '';
  if (result.fullName) {
    message = `Hey${result.fullName} before you login, please check your email to verify your email`;
  } else {
    message = `Welcome back ${result.user!.fullName}!`;
  }

  const { accessToken, refreshToken, user: payload = null } = result;

  // Set refresh token in cookie
  if (refreshToken) AuthUtils.setRefreshTokenInCookie(res, refreshToken);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    accessToken: accessToken,
    payload,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  await AuthServices.verifyEmail(req.params.token);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Email verified successfully',
    payload: null,
  });
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  await AuthServices.resendVerificationEmail(req.body.email);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Verification email sent successfully',
    payload: null,
  });
});

// change password of user by user token
const changePassword = catchAsync(async (req, res) => {
  await AuthServices.changePasswordIntoDB(req.body, req.user!.email);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `Password changed successfully`,
    payload: null,
  });
});

// forget password
const forgetPassword = catchAsync(async (req, res) => {
  await AuthServices.forgetPassword(req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `We’ve sent you an email with instructions to reset your password`,
    payload: null,
  });
});

// reset password
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;

  await AuthServices.resetPasswordIntoDB(req.body.newPassword, token);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `Password has been successfully reset.`,
    payload: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const accessToken = await AuthServices.refreshToken(refreshToken);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `New access token retrieved successfully`,
    accessToken: accessToken,
    payload: null,
  });
});

const createAdminBySuperAdmin = catchAsync(async (req, res) => {
  const payload = await AuthServices.createAdminByAdminIntoDB(req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: `Admin registered successfully`,
    payload,
  });
});

export const AuthControllers = {
  userRegistration,
  login,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  forgetPassword,
  resetPassword,
  refreshToken,
  createAdminBySuperAdmin,
};
