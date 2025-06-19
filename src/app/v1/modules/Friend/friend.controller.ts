import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { FriendServices } from './friend.service';
import { TFriendPaginationQuery } from './friend.interface';

const sendFriendRequest = catchAsync(async (req, res) => {
  const payload = await FriendServices.sendFriendRequest(
    req.user!._id,
    req.body,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Friend request sent successfully',
    payload,
  });
});

const acceptFriendRequest = catchAsync(async (req, res) => {
  const { id: requestId } = req.params;

  const payload = await FriendServices.acceptFriendRequest(
    requestId,
    req.user!._id,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The friend request accepted successfully',
    payload,
  });
});

const rejectFriendRequest = catchAsync(async (req, res) => {
  const { id: requestId } = req.params;

  const payload = await FriendServices.rejectFriendRequest(
    requestId,
    req.user!._id,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'The friend request rejected successfully',
    payload,
  });
});

const undoFriendRequest = catchAsync(async (req, res) => {
  const { id: requestId } = req.params;

  const payload = await FriendServices.undoFriendRequest(
    requestId,
    req.user!._id,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Undo the friend request successfully',
    payload,
  });
});

const getMyReceivedFriendRequests = catchAsync(async (req, res) => {
  const query = req.query as unknown as TFriendPaginationQuery;

  const { receivedFriendRequests: payload, pagination } =
    await FriendServices.getMyReceivedFriendRequests(req.user!._id, query);

  const hasResults = payload.length > 0;

  const message = hasResults
    ? 'You have successfully received your all friend requests.'
    : query.page > 1
      ? 'No received friend requests matched your query criteria.'
      : 'You have no received friend requests.';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const getMySentFriendRequests = catchAsync(async (req, res) => {
  const query = req.query as unknown as TFriendPaginationQuery;

  const { pagination, sentFriendRequests: payload } =
    await FriendServices.getMySentFriendRequests(req.user!._id, query);

  const hasResults = payload.length > 0;

  const message = hasResults
    ? "You've successfully retrieved all your sent friend requests."
    : query.page > 1
      ? 'No sent friend requests matched your query criteria.'
      : 'You have no sent friend requests.';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const getMyFriends = catchAsync(async (req, res) => {
  const query = req.query as unknown as TFriendPaginationQuery;

  const { friends: payload, pagination } = await FriendServices.getMyFriends(
    req.user!._id,
    query,
  );

  const hasResults = payload.length > 0;

  const message = hasResults
    ? "You've successfully retrieved all your friends."
    : query.page > 1
      ? 'No friends matched your query criteria.'
      : 'You have no friends.';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const deleteFriendByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const fullName = await FriendServices.deleteFriendByUserId(
    req.user!._id,
    userId,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: `Friend '${fullName}' removed successfully from your friends list`,
    payload: null,
  });
});

export const FriendControllers = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  undoFriendRequest,
  getMyReceivedFriendRequests,
  getMySentFriendRequests,
  getMyFriends,
  deleteFriendByUserId,
};
