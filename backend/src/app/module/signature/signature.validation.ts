import { z } from 'zod';

export const submitSignatureValidationSchema = z.object({
  body: z.object({
    signatureImage: z
      .string()
      .regex(
        /^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/,
        'Signature image must be a valid Base64 image',
      ),

    gpsLatitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .optional(),

    gpsLongitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .optional(),

    signerName: z.string().trim().min(1, 'Signer name is required'),

    signerEmail: z.string().email('Invalid signer email'),

    consentGiven: z.literal(true, {
      errorMap: () => ({
        message: 'You must agree to the consent before signing the document.',
      }),
    }),
  }),
});
