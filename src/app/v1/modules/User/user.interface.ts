import { UserValidations } from './user.validation';
import { Types } from 'mongoose';
import { USER_ROLE, USER_STATUS } from './user.constant';
import { z } from 'zod';

export type TUserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type TUser = {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  isVerified: boolean;
  role: TUserRole;
  status: TUserStatus;
  suspensionReason: string | null;
  badge: string;
  passwordChangeAt: Date;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
};

export type TUserSuspend = z.infer<typeof UserValidations.suspendUserSchema>;
