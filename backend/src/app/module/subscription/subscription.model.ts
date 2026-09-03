import { model, Schema } from 'mongoose';
import { TSubscriptionPlan, TUserSubscription } from './subscription.interface';

const userSubscriptionSchema = new Schema<TUserSubscription>(
  {
    userId: { type: String, required: true },
    platform: { type: String, enum: ['apple', 'google'], required: true },
    productId: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    originalTransactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending', 'failed', 'refunded'],
      default: 'pending',
    },
    purchasedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    autoRenewing: { type: Boolean, default: false },
    environment: {
      type: String,
      enum: ['sandbox', 'production'],
      required: true,
    },
    rawReceiptData: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

const subscriptionPlanSchema = new Schema<TSubscriptionPlan>(
  {
    planId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    durationDays: { type: Number, required: true },
    appleProductId: { type: String, required: true },
    googleProductId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    features: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export const UserSubscriptionModel = model<TUserSubscription>(
  'UserSubscription',
  userSubscriptionSchema,
);

export const SubscriptionPlanModel = model<TSubscriptionPlan>(
  'SubscriptionPlan',
  subscriptionPlanSchema,
);
