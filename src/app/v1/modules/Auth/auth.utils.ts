import bcrypt from 'bcryptjs';
import config from '../../config';
import jwt, { Secret, SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { Response } from 'express';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TJwtDecoded, TJwtPayload } from './auth.interface';

/** Hash a password */
const bcryptHashPassword = (password: string) =>
  bcrypt.hash(password, Number(config.BCRYPT_SALT_ROUNDS));

/** Compare plain password with hashed password */
const bcryptComparePassword = (
  plainTextPassword: string,
  hashPassword: string,
) => bcrypt.compare(plainTextPassword, hashPassword);

/** Generic function to generate JWT tokens */
const generateJwtToken = (
  payload: TJwtPayload,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'],
) => jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });

/** Generate access token */
const createJwtAccessToken = (jwtPayload: TJwtPayload) =>
  generateJwtToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET_KEY,
    config.JWT_ACCESS_EXP_TIME as SignOptions['expiresIn'],
  );

/** Generate refresh token */
const createJwtRefreshToken = (jwtPayload: TJwtPayload) =>
  generateJwtToken(
    jwtPayload,
    config.JWT_REFRESH_SECRET_KEY,
    config.JWT_REFRESH_EXP_TIME as SignOptions['expiresIn'],
  );

/** Generate reset token */
const createJwtResetToken = (jwtPayload: TJwtPayload) =>
  generateJwtToken(
    jwtPayload,
    config.JWT_RESET_ACCESS_SECRET_KEY,
    config.JWT_RESET_ACCESS_EXP_TIME as SignOptions['expiresIn'],
  );
/** Generate verify email token */
const createJwtVerifyToken = (jwtPayload: TJwtPayload) =>
  generateJwtToken(
    jwtPayload,
    config.JWT_VERIFY_SECRET_KEY,
    config.JWT_VERIFY_EXP_TIME as SignOptions['expiresIn'],
  );

/** Set refresh token in cookie */
const setRefreshTokenInCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV !== 'development',
    httpOnly: true,
    sameSite: 'none',
  });
};

/** Generic function to decode JWT tokens */
const decodeJwtToken = (
  token: string,
  secret: string,
  errorMessage: string,
): TJwtDecoded => {
  try {
    return jwt.verify(token, secret) as TJwtDecoded;
  } catch (error) {
    const isTokenExpired = error instanceof TokenExpiredError;
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      isTokenExpired
        ? `${errorMessage} has expired.`
        : `Invalid ${errorMessage.toLocaleLowerCase()}. Please provide valid authentication credentials.`,
    );
  }
};

/** Decode access token */
const decodedAccessToken = (accessToken: string) =>
  decodeJwtToken(accessToken, config.JWT_ACCESS_SECRET_KEY, 'Access token');

/** Decode refresh token */
const decodedRefreshToken = (refreshToken: string) =>
  decodeJwtToken(refreshToken, config.JWT_REFRESH_SECRET_KEY, 'Refresh token');

/** Decode reset token */
const decodedResetToken = (resetToken: string) =>
  decodeJwtToken(resetToken, config.JWT_RESET_ACCESS_SECRET_KEY, 'Reset token');

const decodedVerifyToken = (verifyToken: string) =>
  decodeJwtToken(verifyToken, config.JWT_VERIFY_SECRET_KEY, 'Verify token');

export const AuthUtils = {
  bcryptHashPassword,
  bcryptComparePassword,
  createJwtAccessToken,
  createJwtRefreshToken,
  createJwtResetToken,
  createJwtVerifyToken,
  decodedAccessToken,
  decodedRefreshToken,
  decodedResetToken,
  decodedVerifyToken,
  setRefreshTokenInCookie,
};
