import { Types } from 'mongoose';
import { Profile } from './profile.model';
import { TProfileUpdate } from './profile.interface';
import { User } from '../User/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const getMyProfile = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId)
    .select('badge username email _id')
    .lean();

  const profile = await Profile.findOne({ userId: user?._id })
    .select('-userId -createdAt')
    .lean();

  if (!user || !profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user profile is not found');
  }

  return {
    ...profile,
    ...user,
  };
};

const updateMyProfile = async (
  userId: Types.ObjectId,
  payload: TProfileUpdate,
) => {
  const result = await Profile.findOneAndUpdate({ userId }, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'The user profile is not found');
  }

  return result;
};

export const ProfileServices = {
  getMyProfile,
  updateMyProfile,
};
