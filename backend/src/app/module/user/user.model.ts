import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { IUser, TUser } from './user.interface';

const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const saltRounds = Number(config.bcrypt_round_salt) || 10;

  this.password = await bcrypt.hash(this.password, saltRounds);

  next();
});

userSchema.statics.isUserExists = async function (email: string) {
  return UserModel.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordCorrect = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  return bcrypt.compare(plainTextPassword, hashPassword);
};

export const UserModel = model<TUser, IUser>('User', userSchema);
