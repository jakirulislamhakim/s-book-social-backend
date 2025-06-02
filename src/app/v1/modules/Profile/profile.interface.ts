import { Types } from 'mongoose';

export type TSocialAccounts = {
  tiktok: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
};

export type TProfile = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  birthdate: Date;
  location: string;
  website: string;
  socialAccounts: TSocialAccounts;
  gender: string;
  createdAt: Date;
  updatedAt: Date;
};
