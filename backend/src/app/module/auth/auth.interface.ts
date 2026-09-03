export type TLoginUser = {
  email: string;
  password: string;
};

export type TGoogleToken = {
  idToken: string;
  role: 'sender' | 'signer';
};

export type TUserAuthData = {
  userEmail: string;
  userId: string;
  role: string;
};

export type TUpdatePasswordAndProfileParams = {
  fullName?: string;
  profilePic?: string;
  oldPassword?: string;
  newPassword?: string;
};

// ---------------------------

export type TRegisterWithEmail = {
  fullName: string;
  email: string;
  password: string;
  role: 'sender' | 'signer';
};

export type TVerifyOTPParams = {
  email: string;
  otp: string;
};

export type TResendOTPParams = {
  email: string;
};

export type TLoginWithEmailParams = {
  email: string;
  password: string;
};

export type TForgetPasswordParams = {
  email: string;
};

export type TResetPasswordParams = {
  userId: string;
  newPassword: string;
};

export type TAppleJwtPayload = {
  sub: string;
  email?: string;
  email_verified?: string;
  is_private_email?: string;
  // no name after first login
};
