import { z } from 'zod';

// Define Zod validation schema

export const registerWithEmailValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required for registration'),
    email: z.string().email({ message: 'Invalid email address' }),
    role: z.enum(['sender', 'signer'], {
      message: 'Role must be either sender or signer',
    }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

export const verifyOTPValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(6, 'OTP must be at least 6 characters long'),
  }),
});

export const resendOTPValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const loginWithGoogleValidationSchema = z.object({
  body: z.object({
    idToken: z.string().min(10, 'idToken is required and must be valid'),
    role: z.enum(['sender', 'signer'], {
      message: 'Role must be either sender or signer',
    }),
  }),
});

export const loginWithAppleValidationSchema = z.object({
  body: z.object({
    role: z.enum(['sender', 'signer'], {
      message: 'Role must be either sender or signer',
    }),
    idToken: z.string().min(10, 'idToken is required and must be valid'),
    fullName: z.string().optional(),
  }),
});

export const loginWithEmailValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

export const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
  }),
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

export const updatePasswordAndProfileValidationSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(1, 'Name cannot be empty').optional(),
      profilePic: z.string().url('Invalid profile picture URL').optional(),
      oldPassword: z
        .string()
        .min(6, 'Old password must be at least 6 characters')
        .optional(),
      newPassword: z
        .string()
        .min(6, 'New password must be at least 6 characters')
        .optional(),
    })
    .refine(
      (data) =>
        (!data.oldPassword && !data.newPassword) ||
        (data.oldPassword && data.newPassword),
      {
        message: 'Both old and new passwords are required to update password.',
        path: ['oldPassword'], // Can point to either 'oldPassword' or 'newPassword'
      },
    ),
});

export const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required!' }),
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string()
        .min(6, { message: 'Old password must be at least 6 characters long' })
        .max(128, { message: 'Old password must be 128 characters or fewer' }),

      newPassword: z
        .string()
        .min(6, { message: 'New password must be at least 6 characters long' })
        .max(128, { message: 'New password must be 128 characters or fewer' }),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: 'New password must be different from old password',
      path: ['newPassword'], // this tells Zod where to attach the error
    }),
});
