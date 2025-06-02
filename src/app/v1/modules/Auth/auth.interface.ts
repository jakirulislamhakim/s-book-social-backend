import { TUserRole } from '../User/user.interface';
import { z } from 'zod';
import { AuthValidations } from './auth.validation';

export type TRegisterUser = z.infer<
  typeof AuthValidations.userRegistrationSchema
>;

export type TLoginUser = {
  identifier: string;
  password: string;
};

export type TJwtPayload = {
  email: string;
  role: TUserRole;
};

export type TJwtDecoded = TJwtPayload & {
  iat: number;
  exp: number;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};
