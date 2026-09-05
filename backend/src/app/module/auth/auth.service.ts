import config from '../../config';
import { UserModel } from '../user/user.model';
import { USER_ROLE } from '../user/user.constant';
import { TLoginUser, TRegisterUser, TUserAuthData } from './auth.interface';
import { generateToken } from './auth.utils';

const registerUserIntoDB = async (payload: TRegisterUser) => {
  const existingUser = await UserModel.findOne({
    email: payload.email,
  });

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const user = await UserModel.create({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    role: USER_ROLE.user,
  });

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};

const loginUserIntoDB = async (payload: TLoginUser) => {
  const user = await UserModel.isUserExists(payload.email);

  if (!user) {
    throw new Error('No account found with this email');
  }

  const isPasswordCorrect = await UserModel.isPasswordCorrect(
    payload.password,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new Error('Incorrect password');
  }

  const jwtPayload: TUserAuthData = {
    userId: user._id!.toString(),
    userEmail: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

export const authServices = {
  registerUserIntoDB,
  loginUserIntoDB,
};
