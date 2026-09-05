import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

import config from "../../config";
import { IUser, TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = Number(config.bcrypt_round_salt) || 10;

  this.password = await bcrypt.hash(this.password, saltRounds);

  next();
});

// Find user with password for login
userSchema.statics.isUserExists = async function (email: string) {
  return UserModel.findOne({ email }).select("+password");
};

// Compare plain password with hashed password
userSchema.statics.isPasswordCorrect = async function (
  plainTextPassword: string,
  hashPassword: string,
) {
  return bcrypt.compare(plainTextPassword, hashPassword);
};

export const UserModel = model<TUser, IUser>("User", userSchema);