import { USER_STATUS } from './../modules/User/user.constant';
import nodeCron from 'node-cron';
import { User } from '../modules/User/user.model';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

export const deleteUsersJob = nodeCron.schedule(
  '0 0 0 * * *',
  async () => {
    try {
      await User.updateMany(
        {
          status: USER_STATUS.SOFT_DELETED,
          deletedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        { status: USER_STATUS.PERMANENT_DELETED },
      );

      console.log('✅ Permanent deleted users job executed', new Date());
    } catch (err) {
      if (err instanceof Error) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
      }

      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        '❌ Error in deleteUsersJob ',
      );
    }
  },

  {
    timezone: 'Asia/Dhaka',
    name: 'permanentDeletedUsersJob',
    noOverlap: true,
  },
);
