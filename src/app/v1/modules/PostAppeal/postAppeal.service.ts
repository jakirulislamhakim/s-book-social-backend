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
import { NotificationUtils } from '../Notification/notification.utils';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_TARGET_TYPE,
  NOTIFICATION_URL_METHOD,
} from '../Notification/notification.constant';

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

  // send notification
  await NotificationUtils.createNotification({
    action: NOTIFICATION_ACTION.POST_APPEAL,
    message:
      'Your post has been appealed. Post will be reviewed by our team and you will be notified.',
    receiverId: userId,
    senderId: null,
    targetType: NOTIFICATION_TARGET_TYPE.POST,
    targetId: new Types.ObjectId(payload.postId),
    url: '/post-appeals',
    url_method: NOTIFICATION_URL_METHOD.GET,
    isFromSystem: true,
  });

  return createPostAppeal;
};

// admin can get all post appeals
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
