/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUser = {
  _id?: string;
  fullName: string;
  email: string;
  googleId?: string;
  appleId?: string;
  provider: 'google' | 'apple' | 'email';
  password: string | null;
  profilePic?: string;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  identityVerificationMethod: 'eID' | 'passport' | null;
  identityVerifiedAt: Date | null;
  identityVerificationId: string | null;
  identityVerificationStatus: 'pending' | 'verified' | 'failed' | null;
  diditVerified?: boolean;
  diditVerifiedAt?: Date;
  diditVerificationExpiresAt?: Date;
  diditSessionId?: string;
  diditPlatform?: 'ios' | 'android' | null;
  diditVerificationStatus?:
    | 'not_started'
    | 'pending'
    | 'approved'
    | 'declined'
    | 'in_review';
  diditVerificationResult?: Record<string, unknown>;
  role: 'sender' | 'signer';
  otp?: string;
  otpExpiresAt?: Date;
  lastLoginAt?: Date;
  resendOtpCount?: number;
  lastResendAt?: Date;
  otpFailedAttempts?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUser extends Model<TUser> {
  isUserExists(email: string): Promise<TUser | null>;
  isPasswordCorrect(
    plainTextPassword: string,
    hashPassword: string,
  ): Promise<boolean>;
}

export type TProfileCardPayload = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  // isIdentityVerified?: boolean;
  diditVerified: boolean;
  appId: 'hoppmanngolf';
};

export type TUserRole = keyof typeof USER_ROLE;
