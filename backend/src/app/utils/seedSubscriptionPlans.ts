import { SubscriptionPlanModel } from '../module/subscription/subscription.model';

export const seedSubscriptionPlans = async () => {
  const existing = await SubscriptionPlanModel.countDocuments();
  if (existing > 0) return; // already seeded, skip

  await SubscriptionPlanModel.insertMany([
    {
      planId: 'trial',
      name: 'Trial',
      price: 2.0,
      currency: 'EUR',
      durationDays: 30,
      appleProductId: 'com.signbigbang.trial',
      googleProductId: 'signbigbang_trial',
      isActive: true,
      features: {
        diditChecks: 1,
        smsOtp: 1,
        basicSignatures: -1, // -1 means unlimited
        signatureRequests: -1,
      },
    },
    {
      planId: 'basic',
      name: 'Basic',
      price: 9.99,
      currency: 'EUR',
      durationDays: 30,
      appleProductId: 'com.signbigbang.basic',
      googleProductId: 'signbigbang_basic',
      isActive: true,
      features: {
        diditChecks: 5,
        smsOtp: 10,
        basicSignatures: -1,
        signatureRequests: 20,
      },
    },
  ]);

  console.log('Subscription plans seeded successfully');
};
