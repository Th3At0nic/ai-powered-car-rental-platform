import z from 'zod';

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

// export const decodeProfileCardValidationSchema = z.object({
//   body: z.object({
//     encryptedPayload: z.string().min(1, 'Encrypted payload is required'),
//   }),
// });

// export const submitEidVerificationValidationSchema = z.object({
//   body: z.object({
//     verified: z.boolean({
//       required_error: 'Verification status is required',
//     }),

//     verificationId: z.string().min(1, 'Verification ID is required'),
//   }),
// });

// export const logBiometricCheckValidationSchema = z.object({
//   body: z.object({
//     verified: z.boolean({
//       required_error: 'Verification status is required',
//     }),
//   }),
// });
