import z from 'zod';

export const createSignRequestValidationSchema = z.object({
  body: z
    .object({
      documentId: z.string().min(1, 'Document ID is required'),

      signers: z
        .array(
          z.object({
            signerEmail: z.string().email('Invalid signer email'),

            signerPhone: z
              .string()
              .min(1, 'Signer phone cannot be empty')
              .optional(),

            requireSms: z.boolean().optional(),

            signerName: z
              .string()
              .min(1, 'Signer name cannot be empty')
              .optional(),

            signatureFieldPosition: z.object({
              page: z
                .number()
                .int('Page must be an integer')
                .min(1, 'Page number must be at least 1'),

              x: z.number().min(0, 'X position cannot be negative'),

              y: z.number().min(0, 'Y position cannot be negative'),

              width: z.number().positive('Width must be greater than 0'),

              height: z.number().positive('Height must be greater than 0'),
            }),
          }),
        )
        .min(1, 'At least one signer is required'),

      smsVerificationMode: z.enum(['none', 'all', 'individual']).optional(),

      requireLivenessCheck: z.boolean().optional(),

      requireIdCheck: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.smsVerificationMode === 'all' ||
        data.smsVerificationMode === 'individual'
      ) {
        data.signers.forEach((signer, index) => {
          const smsRequired =
            data.smsVerificationMode === 'all' || signer.requireSms;

          if (smsRequired && !signer.signerPhone) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['signers', index, 'signerPhone'],
              message:
                'Signer phone is required when SMS verification is enabled.',
            });
          }
        });
      }
    }),
});

export const verifyOTPBeforeSignValidationSchema = z.object({
  body: z.object({
    otp: z.string().min(6, 'OTP must be at least 6 characters long'),
  }),
});
