import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { UserBlockServices } from './block.service';

const userBlock = catchAsync(async (req, res) => {
  const payload = await UserBlockServices.userBlockIntoDB(
    req.user!._id,
    req.body,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'The user has been blocked successfully',
    payload,
  });
});

const userUnBlock = catchAsync(async (req, res) => {
  const payload = await UserBlockServices.userUnblockIntoDB(
    req.user!._id,
    req.params.userId,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The user has been unblocked successfully',
    payload,
  });
});

const getMyAllBlockedUsers = catchAsync(async (req, res) => {
  const payload = await UserBlockServices.getMyAllBlockedUsersFromDB(
    req.user!._id,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload.length > 0
        ? 'Blocked users fetched successfully'
        : 'You have no blocked users',
    payload,
  });
});

export const UserBlockControllers = {
  userBlock,
  userUnBlock,
  getMyAllBlockedUsers,
};
