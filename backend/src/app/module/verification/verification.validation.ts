import z from 'zod';

export const diditStartVerificationValidationSchema = z.object({
  body: z.object({
    platform: z.enum(['ios', 'android'], {
      message: 'Platform must be either ios or android',
    }),
  }),
});
