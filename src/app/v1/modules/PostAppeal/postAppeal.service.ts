import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Post } from '../Post/post.model';
import { TPostAppealCreate } from './postAppeal.interface';
import { PostAppeal } from './postAppeal.model';
import { Types } from 'mongoose';
import { POST_STATUS } from '../Post/post.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  POST_APPEAL_SEARCHABLE_FIELDS,
  POST_APPEAL_STATUS,
} from './postAppeal.constant';

const createPostAppealIntoDB = async (
  payload: TPostAppealCreate,
  userId: Types.ObjectId,
) => {
  const post = await Post.findById(payload.postId)
    .select('userId status')
    .lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post is not found !');
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can not appeal for other user post !',
    );
  }

  if (post.status === POST_STATUS.ACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not appeal for active post !',
    );
  }

  const existPostAppeal = await PostAppeal.findOne({
    userId,
    postId: payload.postId,
    status: { $ne: POST_APPEAL_STATUS.APPROVED },
  })
    .select('status')
    .lean();

  if (existPostAppeal) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You already appealed for this post! Your appeal status: '${existPostAppeal.status}'`,
    );
  }

  const createPostAppeal = await PostAppeal.create({
    ...payload,
    userId,
  });

  return createPostAppeal;
};

const getAllPostAppealsFromDB = async (query: Record<string, unknown>) => {
  const postAppealQuery = new QueryBuilder(
    PostAppeal.find().select('-userId'),
    query,
  )
    .search(POST_APPEAL_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .paginate()
    .fields();

  const postAppeals = await postAppealQuery.modelQuery.populate('post');

  const pagination = await postAppealQuery.paginateMeta();

  return {
    postAppeals,
    pagination,
  };
};

export const PostAppealServices = {
  createPostAppealIntoDB,
  getAllPostAppealsFromDB,
};
