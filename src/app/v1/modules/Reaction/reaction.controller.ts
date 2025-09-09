import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { ReactionServices } from './reaction.service';
import { TReactionCountQuery, TReactionQuery } from './reaction.interface';

const toggleReaction = catchAsync(async (req, res) => {
  const message = await ReactionServices.toggleReaction(
    req.user!._id,
    req.body,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload: null,
  });
});

const getReactions = catchAsync(async (req, res) => {
  const query = req.query as unknown as TReactionQuery;
  const currentUserId = req.user!._id;

  const { reactions: payload, pagination } =
    await ReactionServices.getReactions(currentUserId, query);

  const hasResults = payload.length > 0;
  const hasQuery = Object.keys(query).length > 2;

  const message = hasResults
    ? `Reactions fetched successfully for this ${query.targetType}`
    : hasQuery
      ? `No reactions matched your search criteria to this ${query.targetType}. Please review your filters.`
      : `There are no reactions to this ${query.targetType} yet.`;

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

const getTotalReactions = catchAsync(async (req, res) => {
  const { targetType, targetId } = req.query as unknown as TReactionCountQuery;

  const {
    grouped: payload,
    fullName,
    total,
  } = await ReactionServices.getTotalReactions(targetType, targetId);

  const message =
    total > 1 && fullName
      ? `${fullName} & ${total - 1} others`
      : (fullName ?? 'No one');

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    // message: 'Total reactions fetched successfully',
    message,
    payload,
  });
});

export const ReactionControllers = {
  toggleReaction,
  getReactions,
  getTotalReactions,
};
