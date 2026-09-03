import { z } from 'zod';

export const linkRevenueCatPurchaseValidationSchema = z.object({
  body: z.object({
    event: z.string({ required_error: 'Event is required' }),
    source: z.string({ required_error: 'Source is required' }),
    customer: z.object({
      id: z.string({ required_error: 'Customer ID is required' }),
      verification: z.string({
        required_error: 'Customer verification is required',
      }),
    }),
    entitlement: z
      .object({
        id: z.string(),
        active: z.boolean(),
        willRenew: z.boolean(),
        period: z.string(),
        periodType: z.string(),
        store: z.string(),
        ownershipType: z.string(),
        purchaseDate: z.string(),
        originalPurchaseDate: z.string(),
        expirationDate: z.string(),
      })
      .optional(),
    subscription: z
      .object({
        productId: z.string(),
        active: z.boolean(),
        willRenew: z.boolean(),
        store: z.string(),
        periodType: z.string(),
        purchaseDate: z.string(),
        expirationDate: z.string(),
      })
      .optional(),
  }),
});
