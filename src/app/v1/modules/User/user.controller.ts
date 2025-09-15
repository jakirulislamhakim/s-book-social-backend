import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { UserServices } from './user.service';

const getAllUsers = catchAsync(async (req, res) => {
  const { query } = req;
  const { user: payload, pagination } =
    await UserServices.getAllUsersFromDB(query);

  const hasQuery = Object.keys(query).length > 0;
  const hasResults = payload.length > 0;

  const message = hasResults
    ? 'Users fetched successfully'
    : hasQuery
      ? 'No users matched your search criteria. Please review your filters.'
      : 'No users available in the system.';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const payload = await UserServices.getUserByIdFromDB(id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User fetched successfully',
    payload,
  });
});

const findMentionableFriends = catchAsync(async (req, res) => {
  const currentUserId = req.user!._id;

  const payload = await UserServices.findMentionableFriends(
    currentUserId,
    req.query,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message:
      payload.length > 0
        ? 'Mention friends fetched successfully.'
        : req.query.fullName
          ? 'No friends found for your search criteria.'
          : 'You have no friends',
    payload,
  });
});

const updateUserUsername = catchAsync(async (req, res) => {
  const { username } = req.body;

  const payload = await UserServices.updateUserUsernameIntoDB(req.user!._id, {
    username,
  });

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Username updated successfully',
    payload,
  });
});

const deactivateUser = catchAsync(async (req, res) => {
  const payload = await UserServices.deactivateUserIntoDB(req.user!._id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User deactivated successfully',
    payload,
  });
});

const softDeleteUser = catchAsync(async (req, res) => {
  const payload = await UserServices.softDeleteUserIntoDB(req.user!._id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
    payload,
  });
});

const reactiveUser = catchAsync(async (req, res) => {
  await UserServices.reactiveUserIntoDB(req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User reactivated successfully. Now you can login',
    payload: null,
  });
});

const suspendUser = catchAsync(async (req, res) => {
  const payload = await UserServices.suspendUserIntoDB(req.params.id, req.body);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User suspended successfully',
    payload,
  });
});

const restoreSuspendUser = catchAsync(async (req, res) => {
  const payload = await UserServices.restoreSuspendUserIntoDB(req.params.id);

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Restore suspended user successfully',
    payload,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  findMentionableFriends,
  updateUserUsername,
  deactivateUser,
  softDeleteUser,
  reactiveUser,
  suspendUser,
  restoreSuspendUser,
};
