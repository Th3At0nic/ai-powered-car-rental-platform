export type TRevenueCatWebhookPayload = {
  event: string;
  source: string;
  customer: {
    id: string;
    verification: string;
  };
  entitlement?: {
    id: string;
    active: boolean;
    willRenew: boolean;
    period: string;
    periodType: string;
    store: string;
    ownershipType: string;
    purchaseDate: string;
    originalPurchaseDate: string;
    expirationDate: string;
  };
  subscription?: {
    productId: string;
    active: boolean;
    willRenew: boolean;
    store: string;
    periodType: string;
    purchaseDate: string;
    expirationDate: string;
  };
};

export type TSubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'pending'
  | 'failed'
  | 'refunded';

export type TSubscriptionPlatform = 'apple' | 'google';

export type TSubscriptionEnvironment = 'sandbox' | 'production';

export type TUserSubscription = {
  userId: string;
  platform: TSubscriptionPlatform;
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  status: TSubscriptionStatus;
  purchasedAt: Date;
  expiresAt: Date;
  autoRenewing: boolean;
  environment: TSubscriptionEnvironment;
  rawReceiptData?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TSubscriptionPlan = {
  planId: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  appleProductId: string;
  googleProductId: string;
  isActive: boolean;
  features?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};
