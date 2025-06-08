import { Schema, model } from 'mongoose';
import { TProfile } from './profile.interface';
import { GENDER } from './profile.constant';

const socialAccountsSchema = new Schema(
  {
    tiktok: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { _id: false },
);

const profileSchema = new Schema<TProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: { type: String, required: true },
    bio: { type: String, default: 'No bio!' },
    profilePhoto: {
      type: String,
      default: 'https://i.ibb.co/4jr3Rn6/no-images.png',
    },
    coverPhoto: { type: String, default: '' },
    birthdate: { type: Date },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    socialAccounts: { type: socialAccountsSchema, default: () => ({}) },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export const Profile = model<TProfile>('Profile', profileSchema);
