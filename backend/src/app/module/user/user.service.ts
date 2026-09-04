import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import { TUpdatePasswordAndProfileParams } from '../auth/auth.interface';
import { UserModel } from './user.model';
import { providerTypes } from './user.constant';

const updatePasswordAndProfileIntoDB = async (
  userId: string,
  payload: TUpdatePasswordAndProfileParams,
) => {
  const { oldPassword, newPassword, fullName, profilePic } = payload;

  const user = await UserModel.findById(userId);

  if (!user) {
    throwAppError(
      'email',
      "Couldn't access user info. No user found with this user token. Login and try again.",
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  // Disallow password change for social login users
  if ((oldPassword || newPassword) && user.provider === providerTypes.google) {
    throwAppError(
      'provider',
      'Password change is not allowed for users registered with Google or Apple login.',
      StatusCodes.BAD_REQUEST,
    );
  }

  // Handle password update
  if (oldPassword || newPassword) {
    if (!oldPassword || !newPassword) {
      throwAppError(
        'password',
        'To update password, both oldPassword and newPassword are required.',
        StatusCodes.BAD_REQUEST,
      );
    }

    const isPasswordCorrect = await UserModel.isPasswordCorrect(
      oldPassword as string,
      user.password as string,
    );

    if (!isPasswordCorrect) {
      throwAppError(
        'oldPassword',
        'Your old password is incorrect. Try again with a valid password.',
        StatusCodes.BAD_REQUEST,
      );
    }

    // Check if new password is same as current one
    const isSamePassword = await UserModel.isPasswordCorrect(
      newPassword as string,
      user?.password as string,
    );
    if (isSamePassword) {
      throwAppError(
        'newPassword',
        'New password must be different from the current password.',
        StatusCodes.BAD_REQUEST,
      );
    }

    user.password = newPassword as string; // Will be hashed by pre-save hook
  }

  // Handle profile updates (name or profilePic)
  if (fullName) user.fullName = fullName;
  if (profilePic) user.profilePic = profilePic;

  const updatedUser = await user.save();

  if (!updatedUser) {
    throwAppError(
      '',
      "Something went wrong. Couldn't update your profile. Try again.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  // Optionally nullify sensitive fields
  updatedUser.password = null;

  return updatedUser;
};

const getMyProfileFromDB = async (userId: string) => {
  const result = await UserModel.findById(userId).select(
    '-password -__v -otp -otpExpiresAt -resendOtpCount -lastResendAt -diditSessionId -diditVerificationResult -identityVerificationId -lastLoginAt',
  );
  if (!result) {
    return throwAppError('user', 'User not found', StatusCodes.NOT_FOUND);
  }
  return result;
};

// const submitEidVerificationIntoDB = async (
//   userId: string,
//   body: { verified: boolean; verificationId: string },
// ) => {
//   const { verified, verificationId } = body;

//   const updatePayload = verified
//     ? {
//         isIdentityVerified: true,
//         identityVerificationMethod: 'eID',
//         identityVerifiedAt: new Date(),
//         identityVerificationId: verificationId,
//         identityVerificationStatus: 'verified',
//       }
//     : {
//         identityVerificationStatus: 'failed',
//       };

//   const updatedUser = await UserModel.findByIdAndUpdate(userId, updatePayload, {
//     new: true,
//   }).select('-password -__v');

//   if (!updatedUser) {
//     return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
//   }

//   return updatedUser;
// };

export const UserServices = {
  updatePasswordAndProfileIntoDB,
  getMyProfileFromDB,
};
