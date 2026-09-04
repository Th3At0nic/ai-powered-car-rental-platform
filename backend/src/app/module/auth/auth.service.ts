import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import { UserModel } from '../user/user.model';
import { providerTypes } from '../user/user.constant';
import { generateToken } from './auth.utils';
import config from '../../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  TAppleJwtPayload,
  TForgetPasswordParams,
  TLoginWithEmailParams,
  TRegisterWithEmail,
  TResendOTPParams,
  TResetPasswordParams,
  TVerifyOTPParams,
} from './auth.interface';
import { generateOTP } from '../../utils/generateOTP';
import { sendEmailOTP } from '../../utils/sendEmail';
import { TUser } from '../user/user.interface';
import {
  MAX_RESEND,
  OTP_EXPIRATION_MINUTES,
  RESEND_INTERVAL_MS,
  RESET_WINDOW_MS,
} from './auth.constants';
import { verifyAppleToken } from '../../utils/verifyAppleToken';

const registerWithEmailIntoDB = async (payload: TRegisterWithEmail) => {
  const existingUser = await UserModel.isUserExists(payload?.email);

  if (existingUser && existingUser.isEmailVerified) {
    throwAppError(
      'email',
      `This email is already registered. Please login.`,
      StatusCodes.CONFLICT,
    );
  }

  if (existingUser && !existingUser.isEmailVerified) {
    throwAppError(
      'email',
      `This email is already registered but not verified. Please complete your email verification`,
      StatusCodes.CONFLICT,
    );
  }

  // Generate OTP and expiry
  const otp = generateOTP(); // e.g., '8435'

  const otpExpiresAt = new Date(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  const userData = {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password, // Use plain password here, it will be hashed in the model
    role: payload.role,
    isEmailVerified: false,
    provider: providerTypes.email,
    otp,
    otpExpiresAt,
    otpFailedAttempts: 0, // reset on new OTP
  };

  const user = await UserModel.create(userData);

  // if (process.env.NODE_ENV === 'development') {
  //   return {
  //     message: `Registration successful.

  //     Development OTP: Your OTP for email: ${user.email} is ${otp}

  //     Note: Email verification is currently bypassed in the development environment. We are using the generated OTP directly for testing purposes. In the production environment, the OTP will be delivered securely through email.`,
  //   };
  // }
  // Send OTP email
  const sendEmailResult = await sendEmailOTP(user.email as string, otp);

  if (sendEmailResult?.success) {
    return {
      message: `Registration successful. ${sendEmailResult.message} Please check your email (including the spam folder) to verify your OTP.`,
    };
  } else {
    throwAppError(
      'sendEmail',
      `Failed to send OTP email`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

const verifyOTPIntoDB = async (payload: TVerifyOTPParams) => {
  const { email, otp } = payload;

  // Find user by email
  const user = await UserModel.findOne({ email });

  if (!user) {
    throwAppError(
      'user',
      'User not found. Please register first.',
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  // Check failed attempts BEFORE comparing OTP
  if (user.otpFailedAttempts && user.otpFailedAttempts >= 3) {
    return throwAppError(
      'otp',
      'Too many failed attempts. Please request a new OTP.',
      StatusCodes.TOO_MANY_REQUESTS,
    );
  }

  // Check if OTP matches
  if (user.otp !== otp) {
    // Increment failed attempts
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: { otpFailedAttempts: 1 },
    });
    return throwAppError(
      'otp',
      'Invalid OTP. Please try again.',
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check if OTP is expired
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    return throwAppError(
      'otp',
      'OTP has expired. Please request a new one.',
      StatusCodes.GONE,
    );
  }

  // OTP correct — reset failed attempts and clear OTP
  user.isEmailVerified = true;
  user.otp = '';
  user.otpExpiresAt = undefined;
  user.otpFailedAttempts = 0; // reset counter

  const result = await user.save();

  const jwtPayload = {
    userId: (user as TUser)._id as string,
    role: user?.role as string,
    userEmail: user?.email as string,
  };

  // create access token and send it to the client
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

  if (result?.isEmailVerified) {
    return {
      message: 'OTP verified successfully.',
      accessToken,
      refreshToken,
      user: result,
    };
  } else {
    throwAppError(
      'database',
      'Failed to verify OTP. Please try again later.',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

const resendOTPFromDB = async (contact: TResendOTPParams) => {
  const { email } = contact;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throwAppError(
      'email',
      'No account found with this email.',
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  if (user.isEmailVerified) {
    throwAppError(
      'email',
      'This account is already verified.',
      StatusCodes.BAD_REQUEST,
    );
  }

  if (user.googleId || user.provider === 'google') {
    throwAppError(
      'provider',
      'OTP resend is not allowed for users registered with Google or Apple login.',
      StatusCodes.BAD_REQUEST,
    );
  }

  const now = Date.now();
  const lastResend = user.lastResendAt?.getTime() || 0;

  // Block if it's too soon
  if (now - lastResend < RESEND_INTERVAL_MS) {
    throwAppError(
      'resend',
      `Please wait at least ${RESEND_INTERVAL_MS / 1000} seconds before trying again.`,
      StatusCodes.TOO_MANY_REQUESTS,
    );
  }

  // Reset resend count after the window
  if (now - lastResend > RESET_WINDOW_MS) {
    user.resendOtpCount = 0;
  }

  // Check max attempts
  if (user.resendOtpCount! >= MAX_RESEND) {
    throwAppError(
      'resend',
      `Maximum resend attempts reached. Try again later.`,
      StatusCodes.TOO_MANY_REQUESTS,
    );
  }

  const otp = generateOTP();
  const otpExpiresAt = new Date(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  user.resendOtpCount! += 1;
  user.lastResendAt = new Date();
  user.otpFailedAttempts = 0;

  await user.save();

  // if (process.env.NODE_ENV === 'development') {
  //   return {
  //     message: `Resent OTP successful.

  //     Development OTP: Your OTP for email: ${user.email} is ${otp}

  //     Note: Email verification is currently bypassed in the development environment. We are using the generated OTP directly for testing purposes. In the production environment, the OTP will be delivered securely through email.`,
  //   };
  // }

  // Send OTP email
  if (user.email) {
    const sendEmailResult = await sendEmailOTP(user.email, otp);
    if (sendEmailResult?.success) {
      return {
        message: `OTP resent to ${user.email} successfully. Please check your email (including the spam folder) to verify your OTP.`,
      };
    } else {
      throwAppError(
        'sendEmail',
        `Failed to send OTP email`,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  throwAppError(
    'contact',
    'Something went wrong while resending OTP. Please try again.',
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

const registerOrLoginWithAppleIntoDB = async (payload: {
  role: 'sender' | 'signer';
  idToken: string;
  profilePic?: string; // optional, can be null
  fullName?: string; // frontend can optionally pass name on first sign-in (after first login, name won't be available) but at first login, name is required and apple will return it at first login
}) => {
  const appleClaimsResult = await verifyAppleToken(payload.idToken);

  if (!appleClaimsResult) {
    throwAppError(
      'appleToken',
      'Failed to verify Apple token.',
      StatusCodes.UNAUTHORIZED,
    );
    return;
  }

  const appleClaims: TAppleJwtPayload = {
    sub: appleClaimsResult.appleId,
    email: appleClaimsResult.email,
    email_verified: appleClaimsResult.emailVerified ? 'true' : 'false',
    is_private_email: appleClaimsResult.isPrivateEmail ? 'true' : 'false',
  };

  if (!appleClaims.email || appleClaims.email_verified !== 'true') {
    throwAppError(
      'email',
      'Apple account email is not verified.',
      StatusCodes.FORBIDDEN,
    );
  }

  let userDoc = await UserModel.findOne({
    $or: [{ appleId: appleClaims.sub }, { email: appleClaims.email }],
  });

  if (!userDoc) {
    // Use name if provided by frontend, else fallback
    const fullName = payload.fullName?.trim() || 'Apple User';

    const newUser = {
      fullName: fullName,
      profilePic: payload.profilePic || null,
      email: appleClaims.email,
      appleId: appleClaims.sub,
      provider: providerTypes.apple,
      role: payload.role,
      isEmailVerified: true,
    };

    userDoc = await UserModel.create(newUser);

    if (!userDoc) {
      throwAppError(
        'user',
        'Failed to create user.',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  const jwtPayload = {
    userId: userDoc._id.toString(),
    userEmail: userDoc.email,
    role: userDoc.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    userDoc,
  };
};

const loginWithEmailIntoDB = async (payload: TLoginWithEmailParams) => {
  const { email, password } = payload;

  // Check if user exists
  const user = await UserModel.isUserExists(email);

  if (!user) {
    throwAppError(
      'email',
      `No user found with the email: ${email}. Please register first.`,
      StatusCodes.NOT_FOUND,
    );
    return;
  } else if (!user.isEmailVerified) {
    throwAppError(
      'email',
      `This email is not verified. Please complete your email verification.`,
      StatusCodes.FORBIDDEN,
    );
  }

  // Check if user is registered with Google or Apple
  if (user.provider === providerTypes.google) {
    throwAppError(
      'provider',
      'Login with email is not allowed for users registered with Google or Apple login.',
      StatusCodes.BAD_REQUEST,
    );
  }

  // Check password
  const isPasswordCorrect = await UserModel.isPasswordCorrect(
    password,
    user.password as string,
  );

  if (!isPasswordCorrect) {
    throwAppError(
      'password',
      'Incorrect password. Please try again.',
      StatusCodes.UNAUTHORIZED,
    );
  }

  const jwtPayload = {
    userId: user._id as string,
    userEmail: user.email,
    role: user.role as string,
  };

  // create access token and send it to the client
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

  user.password = null; // Nullify password in memory
  return {
    accessToken,
    refreshToken,
    user,
  };
};

const forgetPasswordIntoDB = async (payload: TForgetPasswordParams) => {
  const { email } = payload; // Either email must be provided

  // let user: typeof UserModel.prototype | null = null;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throwAppError(
      'email',
      `No user found with the email: ${email}. Please register first.`,
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  // Generate OTP and expiry
  const otp = generateOTP(); //otp will be 5 digits
  const otpExpiresAt = new Date(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );
  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  user.otpFailedAttempts = 0;

  user.isEmailVerified = false; // Reset verification status for password reset
  user.lastResendAt = new Date(); // Reset last resend time
  user.resendOtpCount = 0; // Reset resend count

  await user.save();

  // if (process.env.NODE_ENV === 'development') {

  //   return {
  //     message: `Forget Password OTP: Your OTP for email: ${user.email} is ${otp}

  //     Note: Email verification is currently bypassed in the development environment. We are using the generated OTP directly for testing purposes. In the production environment, the OTP will be delivered securely through email.`,
  //   };
  // }

  // Send OTP email or SMS
  const sendEmailResult = await sendEmailOTP(user.email, otp);
  if (sendEmailResult?.success) {
    return {
      message: `OTP sent to ${user.email}. Please check your email (including the spam folder) to reset your password.`,
    };
  } else {
    throwAppError(
      'sendEmail',
      `Failed to send OTP email`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  throwAppError(
    'contact',
    'Something went wrong while sending OTP. Please try again.',
    StatusCodes.INTERNAL_SERVER_ERROR,
  );

  return null; // This line is just to satisfy TypeScript, it won't be reached
};

const resetPasswordIntoDB = async (payload: TResetPasswordParams) => {
  const user = await UserModel.findById(payload.userId);

  if (!user) {
    throwAppError(
      'email',
      `No user found. Please register first.`,
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  // Check password
  const isPasswordCorrect = await UserModel.isPasswordCorrect(
    payload.newPassword,
    user.password as string,
  );

  if (isPasswordCorrect) {
    throwAppError(
      'password',
      'New password cannot be the same as the old password. Please choose a different password.',
      StatusCodes.BAD_REQUEST,
    );
  }

  user.password = payload.newPassword; // Set new password

  const updatedUser = await user.save(); // This will trigger the pre-save hook to hash the password

  if (!updatedUser) {
    throwAppError(
      'database',
      "Couldn't update the password. Please try again later.",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    message:
      'Password reset successfully. You can now log in with your new password.',
  };
};

const createNewAccessTokenByRefreshToken = async (token: string) => {
  if (!token) {
    throwAppError(
      'authorization',
      'Authorization is required to access this resource.',
      StatusCodes.UNAUTHORIZED,
    );
  }

  // check if the token is valid
  // invalid token
  const decoded = jwt.verify(token, config.jwt_refresh_secret as string);

  // decoded undefined
  const { userEmail, role } = decoded as JwtPayload;

  // req.user = decoded as JwtPayload;

  const user = await UserModel.findOne({ email: userEmail, role }).select(
    '-password',
  );

  if (!user) {
    throwAppError(
      'email',
      `The ${role} with the email: ${userEmail} not found in the system. Please recheck the Email and try again`,
      StatusCodes.NOT_FOUND,
    );
  }

  if (user) {
    const jwtPayload = {
      userId: user._id,
      userEmail: user.email,
      role: user.role,
    };

    //create access token and send it to the client
    const accessToken = generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );
    return { accessToken, user };
  } else return null;
};

export const authServices = {
  registerWithEmailIntoDB,
  verifyOTPIntoDB,
  resendOTPFromDB,
  registerOrLoginWithAppleIntoDB,
  loginWithEmailIntoDB,
  forgetPasswordIntoDB,
  resetPasswordIntoDB,
  createNewAccessTokenByRefreshToken,
};
