import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import { UserModel } from './user.model';

const getMyProfileFromDB = async (userId: string) => {
  const user = await UserModel.findById(userId).select('-password');

  if (!user) {
    throwAppError(
      'userId',
      'User not found with this user id',
      StatusCodes.NOT_FOUND,
    );
  }

  return user;
};

export const userServices = {
  getMyProfileFromDB,
};
