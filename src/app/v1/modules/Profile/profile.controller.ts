import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { ProfileServices } from './profile.service';
import { Express } from 'express';

const getMyProfile = catchAsync(async (req, res) => {
  const payload = await ProfileServices.getMyProfile(req.user!._id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved your profile.',
    payload,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const profilePhoto = files.profilePhoto?.[0]?.path;
  const coverPhoto = files.coverPhoto?.[0]?.path;

  const body = {
    ...req.body,
    ...(profilePhoto && { profilePhoto }),
    ...(coverPhoto && { coverPhoto }),
  };

  const payload = await ProfileServices.updateMyProfile(req.user!._id, body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully updated your profile.',
    payload,
  });
});

const getProfileByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user!._id;

  const payload = await ProfileServices.getProfileByUserId(
    currentUserId,
    userId,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Successfully retrieved the user profile.',
    payload,
  });
});

export const ProfileControllers = {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
};
