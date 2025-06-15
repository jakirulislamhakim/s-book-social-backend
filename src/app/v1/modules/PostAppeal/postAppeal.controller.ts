import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { PostAppealServices } from './postAppeal.service';

const createPostAppeal = catchAsync(async (req, res) => {
  const payload = await PostAppealServices.createPostAppealIntoDB(
    req.body,
    req.user!._id,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Your appeal successfully submitted',
    payload,
  });
});

const getAllPostAppeals = catchAsync(async (req, res) => {
  const { query } = req;

  const { postAppeals: payload, pagination } =
    await PostAppealServices.getAllPostAppealsFromDB(query);

  const hasQuery = Object.keys(query).length > 0;
  const hasResults = payload.length > 0;

  const message = hasResults
    ? 'Post Appeals fetched successfully'
    : hasQuery
      ? 'No post appeals matched your search criteria. Please review your filters.'
      : 'No post appeals available in the system.';

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message,
    payload,
    pagination,
  });
});

export const PostAppealControllers = {
  createPostAppeal,
  getAllPostAppeals,
};
