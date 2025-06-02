import { UserUtils } from './../modules/User/user.util';
import config from '../config';
import { AuthUtils } from '../modules/Auth/auth.utils';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';
import { Profile } from '../modules/Profile/profile.model';
import mongoose from 'mongoose';

// the fnc execute only once when the app is running for the first time
export const seedFirstSuperAdminIntoDB = async () => {
  const user = await User.findOne({
    email: config.SUPER_ADMIN_EMAIL,
    role: USER_ROLE.SUPER_ADMIN,
  });

  // if not found super admin then seed super admin into db
  if (!user) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const password = await AuthUtils.bcryptHashPassword(
        config.SUPER_ADMIN_PASSWORD,
      );

      const username = await UserUtils.generateUniqueUsername(
        config.SUPER_ADMIN_FULLNAME,
      );

      const superAdmin = await User.create(
        [
          {
            email: config.SUPER_ADMIN_EMAIL,
            username,
            role: USER_ROLE.SUPER_ADMIN,
            isVerified: true,
            badge: 'https://i.ibb.co/v6JfWNzY/badge.jpg',
            password,
          },
        ],
        {
          session,
        },
      );

      await Profile.create(
        [
          {
            userId: superAdmin[0]._id,
            fullName: config.SUPER_ADMIN_FULLNAME,
            gender: config.SUPER_ADMIN_GENDER,
            birthdate: new Date(config.SUPER_ADMIN_BIRTHDATE),
          },
        ],
        {
          session,
        },
      );

      // eslint-disable-next-line no-console
      console.log('First admin seeded successfully');
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};
