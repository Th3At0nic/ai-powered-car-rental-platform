import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import { TUpdatePasswordAndProfileParams } from '../auth/auth.interface';
import { UserModel } from './user.model';
import { providerTypes } from './user.constant';
import {
  decryptProfileCard,
  encryptProfileCard,
} from '../../utils/profileCardCrypto';
// import { createAuditLog } from '../../utils/createAuditLog';
import { TProfileCardPayload } from './user.interface';
import { createAuditLog } from '../../utils/createAuditLog';
import mongoose from 'mongoose';
import { DocumentModel } from '../document/document.model';
import { SignRequestModel } from '../signRequest/signRequest.model';
import { AuditLogModel } from '../auditLog/auditLog.model';
import { SignatureModel } from '../signature/signature.model';

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

const getProfileCardFromDB = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  const payload: TProfileCardPayload = {
    userId: String(user._id),
    fullName: user.fullName,
    email: user.email,
    // ...(user.phone && { phone: user.phone }), // only include if exists
    profilePhoto: user.profilePic,
    // isIdentityVerified: user.isIdentityVerified,
    diditVerified: user.diditVerified as boolean,
    appId: 'hoppmanngolf',
  };

  const encryptedPayload = encryptProfileCard(payload);

  return { encryptedPayload };
};

const decodeProfileCard = async (encryptedPayload: string) => {
  const decoded = decryptProfileCard(encryptedPayload) as TProfileCardPayload;

  if (decoded.appId !== 'hoppmanngolf') {
    throwAppError(
      'appId',
      'This card was not issued by this application',
      StatusCodes.BAD_REQUEST,
    );
  }

  return decoded;
};

const submitEidVerificationIntoDB = async (
  userId: string,
  body: { verified: boolean; verificationId: string },
) => {
  const { verified, verificationId } = body;

  const updatePayload = verified
    ? {
        isIdentityVerified: true,
        identityVerificationMethod: 'eID',
        identityVerifiedAt: new Date(),
        identityVerificationId: verificationId,
        identityVerificationStatus: 'verified',
      }
    : {
        identityVerificationStatus: 'failed',
      };

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updatePayload, {
    new: true,
  }).select('-password -__v');

  if (!updatedUser) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  return updatedUser;
};

const logBiometricCheckIntoDB = async (userId: string, verified: boolean) => {
  const user = await UserModel.findById(userId).select('role');

  if (!user) {
    return throwAppError('userId', 'User not found', StatusCodes.NOT_FOUND);
  }

  await createAuditLog({
    actorId: userId,
    actorRole: user.role,
    action: 'biometric_check',
    description: `Biometric verification ${verified ? 'succeeded' : 'failed'}`,
  });

  return { success: verified };
};

const deleteUserPermanentlyFromDb = async (userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Fetch user to verify existence and extract email
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throwAppError('user', 'User not found', StatusCodes.NOT_FOUND);
      return;
    }

    const stringUserId = String(user._id);

    // 2. Collect all Document IDs owned by the user (as Sender)
    const userDocuments = await DocumentModel.find(
      { senderId: stringUserId },
      { _id: 1 },
    ).session(session);
    const documentIds = userDocuments.map((doc) => String(doc._id));

    // 3. Collect all SignRequest IDs created by the user (as Sender)
    const userSignRequests = await SignRequestModel.find(
      { senderId: stringUserId },
      { _id: 1 },
    ).session(session);
    const signRequestIds = userSignRequests.map((sr) => String(sr._id));

    // 4. Delete all Audit Logs linked by actorId OR linked documentIds / signRequestIds
    await AuditLogModel.deleteMany({
      $or: [
        { actorId: stringUserId },
        ...(documentIds.length > 0
          ? [{ documentId: { $in: documentIds } }]
          : []),
        ...(signRequestIds.length > 0
          ? [{ signRequestId: { $in: signRequestIds } }]
          : []),
      ],
    }).session(session);

    // 5. Delete all Signatures linked by signerId/email OR linked documentIds / signRequestIds
    await SignatureModel.deleteMany({
      $or: [
        { signerId: stringUserId },
        { signerEmail: user.email },
        ...(documentIds.length > 0
          ? [{ documentId: { $in: documentIds } }]
          : []),
        ...(signRequestIds.length > 0
          ? [{ signRequestId: { $in: signRequestIds } }]
          : []),
      ],
    }).session(session);

    // 6. Delete SignRequests owned by user
    await SignRequestModel.deleteMany({ senderId: stringUserId }).session(
      session,
    );

    // 7. Delete Documents owned by user
    await DocumentModel.deleteMany({ senderId: stringUserId }).session(session);

    // 8. Delete the User document itself
    await UserModel.findByIdAndDelete(user._id).session(session);

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const UserServices = {
  updatePasswordAndProfileIntoDB,
  getMyProfileFromDB,
  getProfileCardFromDB,
  decodeProfileCard,
  submitEidVerificationIntoDB,
  logBiometricCheckIntoDB,
  deleteUserPermanentlyFromDb,
};
