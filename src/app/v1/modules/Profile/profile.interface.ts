import { Types } from 'mongoose';
import { z } from 'zod';
import { ProfileValidations } from './profile.validation';

export type TSocialAccounts = {
  tiktok: string;
  facebook: string;
  instagram: string;
  linkedin: string;
};

export type TProfile = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  bio: string;
  profilePhoto: string;
  coverPhoto: string;
  birthdate: Date;
  location: string;
  website: string;
  socialAccounts: TSocialAccounts;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TProfileUpdate = z.infer<
  typeof ProfileValidations.updateProfileSchema
>;
