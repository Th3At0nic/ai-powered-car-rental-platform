/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import throwAppError from '../../utils/throwAppError';
import {
  SubscriptionPlanModel,
  UserSubscriptionModel,
} from './subscription.model';
import config from '../../config';
import { TRevenueCatWebhookPayload } from './subscription.interface';

const getSubscriptionStatusFromDB = async (userId: string) => {
  if (!userId) {
    return throwAppError(
      'userId',
      'User ID is required',
      StatusCodes.BAD_REQUEST,
    );
  }

  const subscription = await UserSubscriptionModel.findOne({ userId }).sort({
    createdAt: -1,
  });

  if (!subscription) {
    return {
      hasSubscription: false,
      isActive: false,
      status: null,
      plan: null,
      expiresAt: null,
      autoRenewing: false,
      platform: null,
      environment: null,
      daysRemaining: null,
    };
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (subscription.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );

  const plan = await SubscriptionPlanModel.findOne({
    $or: [
      { appleProductId: subscription.productId },
      { googleProductId: subscription.productId },
    ],
  });

  return {
    hasSubscription: true,
    isActive:
      subscription.status === 'active' && subscription.expiresAt > new Date(),
    status: subscription.status,
    plan: plan
      ? {
          planId: plan.planId,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          durationDays: plan.durationDays,
        }
      : null,
    expiresAt: subscription.expiresAt,
    autoRenewing: subscription.autoRenewing,
    platform: subscription.platform,
    environment: subscription.environment,
    daysRemaining,
  };
};

const getAvailablePlansFromDB = async () => {
  const plans = await SubscriptionPlanModel.find({ isActive: true }).select({
    planId: 1,
    name: 1,
    price: 1,
    currency: 1,
    durationDays: 1,
    appleProductId: 1,
    googleProductId: 1,
    features: 1,
    _id: 0,
  });

  if (!plans || plans.length === 0) {
    return throwAppError(
      'plans',
      'No active subscription plans found',
      StatusCodes.NOT_FOUND,
    );
  }

  return plans;
};

const linkRevenueCatPurchase = async (
  userId: string,
  payload: TRevenueCatWebhookPayload,
) => {
  if (!userId || !payload) {
    return throwAppError(
      'payload',
      'userId and payload are required',
      StatusCodes.BAD_REQUEST,
    );
  }

  const productId = payload.subscription?.productId;
  const purchaseDate = payload.entitlement?.purchaseDate;
  const expirationDate = payload.entitlement?.expirationDate;
  const willRenew = payload.entitlement?.willRenew;
  const store = payload.entitlement?.store;
  const revenueCatCustomerId = payload.customer?.id;

  if (!productId || !purchaseDate || !expirationDate) {
    return throwAppError(
      'payload',
      'Invalid RevenueCat payload — missing required fields',
      StatusCodes.BAD_REQUEST,
    );
  }

  const normalizedStore = store ? store.toLowerCase() : '';
  const platform: 'apple' | 'google' =
    normalizedStore.includes('google') || normalizedStore === 'play_store'
      ? 'google'
      : 'apple';

  const environment: 'sandbox' | 'production' =
    normalizedStore === 'teststore' || normalizedStore.includes('sandbox')
      ? 'sandbox'
      : 'production';

  // Check duplicate
  const existing = await UserSubscriptionModel.findOne({
    transactionId: revenueCatCustomerId,
    userId,
  });

  if (existing && existing.status === 'active') {
    return existing;
  }

  const subscription = await UserSubscriptionModel.findOneAndUpdate(
    { transactionId: revenueCatCustomerId },
    {
      userId,
      platform,
      productId,
      transactionId: revenueCatCustomerId,
      originalTransactionId: revenueCatCustomerId,
      status: payload.entitlement?.active ? 'active' : 'expired',
      purchasedAt: new Date(purchaseDate),
      expiresAt: new Date(expirationDate),
      autoRenewing: willRenew ?? false,
      environment,
      rawReceiptData: payload,
    },
    { upsert: true, new: true },
  );

  // return {
  // linked: true,
  // status: 'active',
  // expiresAt: new Date(expirationDate),
  // platform,
  // environment,
  // };
  return subscription;
};

const handleRevenueCatWebhook = async (
  payload: TRevenueCatWebhookPayload,
  secret: string,
) => {
  if (!config.revenueCatEnabled) {
    return { received: true, message: 'RevenueCat is currently disabled' };
  }

  if (!secret || secret !== config.revenueCatWebhookSecret) {
    return throwAppError(
      'webhookSecret',
      'Invalid webhook secret',
      StatusCodes.UNAUTHORIZED,
    );
  }

  const revenueCatCustomerId = payload.customer?.id;
  if (!revenueCatCustomerId) {
    return { received: true };
  }

  const subscription = await UserSubscriptionModel.findOne({
    transactionId: revenueCatCustomerId,
  });

  if (!subscription) {
    return { received: true };
  }

  const event = payload.event;
  const updates: Record<string, any> = {};

  if (event === 'purchase_success' || event === 'renewal') {
    updates.status = 'active';
    if (payload.entitlement?.expirationDate) {
      updates.expiresAt = new Date(payload.entitlement.expirationDate);
    }
    if (payload.entitlement?.willRenew !== undefined) {
      updates.autoRenewing = payload.entitlement.willRenew;
    }
  } else if (event === 'cancellation') {
    updates.status = 'cancelled';
    updates.autoRenewing = false;
  } else if (event === 'expiration') {
    updates.status = 'expired';
  } else if (event === 'refund') {
    updates.status = 'refunded';
  } else if (event === 'billing_issue') {
    updates.status = 'failed';
  } else {
    return { received: true };
  }

  await UserSubscriptionModel.updateOne(
    { transactionId: revenueCatCustomerId },
    { $set: updates },
  );

  return { received: true };
};

export const SubscriptionService = {
  getSubscriptionStatusFromDB,
  getAvailablePlansFromDB,
  linkRevenueCatPurchase,
  handleRevenueCatWebhook,
};
