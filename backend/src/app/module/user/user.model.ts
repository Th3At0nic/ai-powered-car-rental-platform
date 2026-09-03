import { model, Schema } from 'mongoose';
import { IUser, TUser } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

const userSchema = new Schema<TUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true },
    provider: {
      type: String,
      enum: ['email', 'google', 'apple'],
      required: true,
    },
    // password: { type: String, required: true },
    password: {
      type: String,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
      required: function (this: any) {
        return this.provider === 'email';
      },
      default: null,
    },
    profilePic: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isIdentityVerified: { type: Boolean, default: false },
    identityVerificationMethod: {
      type: String,
      enum: ['eID', 'passport', null],
      default: null,
    },
    identityVerifiedAt: { type: Date, default: null },
    identityVerificationId: { type: String, default: null },
    identityVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed', null],
      default: null,
    },
    diditVerified: { type: Boolean, default: false },
    diditVerifiedAt: { type: Date, default: null },
    diditVerificationExpiresAt: { type: Date, default: null },
    diditSessionId: { type: String, default: null },
    diditPlatform: {
      type: String,
      enum: ['ios', 'android', null],
      default: null,
    },
    diditVerificationStatus: {
      type: String,
      enum: ['not_started', 'pending', 'approved', 'declined', 'in_review'],
      default: 'not_started',
    },
    diditVerificationResult: { type: Schema.Types.Mixed, default: null },
    role: { type: String, enum: ['sender', 'signer'], required: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
    resendOtpCount: { type: Number, default: 0 },
    lastResendAt: { type: Date, default: null },
    otpFailedAttempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

//creating or using mongoose middleware like pre and post
// userSchema.pre('save', async function () {
//   this.password = await bcrypt.hash(
//     this.password,
//     Number(config.bcrypt_round_salt),
//   );
// });

userSchema.pre('save', async function (next) {
  // Only hash password if it's set (for local register)
  if (this.isModified('password') && this.password) {
    const saltRounds = Number(config.bcrypt_round_salt) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// hiding the password from the response document to keep the privacy.
userSchema.post('save', function (doc) {
  doc.password = '';
});

//finding for existing user in the db so prevent duplicate creation
userSchema.statics.isUserExists = async function (email: string) {
  const existingUser = await UserModel.findOne({ email }).select('+password');
  return existingUser;
};

userSchema.statics.isPasswordCorrect = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  const authPassword = await bcrypt.compare(plainTextPassword, hashPassword);
  return authPassword;
};

export const UserModel = model<TUser, IUser>('User', userSchema);
