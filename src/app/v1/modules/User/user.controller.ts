import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { sendApiResponse } from '../../utils/sendApiResponse';
import { UserServices } from './user.service';

const changeUserRole = catchAsync(async (req, res) => {
  const currentUserEmail = req.user?.email;
  const { user_id } = req.params;

  const payload = await UserServices.changeUserRoleIntoDB(
    user_id,
    req.body,
    currentUserEmail as string,
  );

  sendApiResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User role change successfully',
    payload,
  });
});

export const UserController = {
  changeUserRole,
};
