import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5011,
  database_url: process.env.DATABASE_URL,
  bcrypt_round_salt: process.env.BCRYPT_SALT_ROUND,
  NODE_ENV: process.env.NODE_ENV,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  stripe_secret_key: process.env.STRIPE_SECRET_KEY,

  // profileCardSecret: process.env.PROFILE_CARD_SECRET,

  // google_client_id: process.env.GOOGLE_CLIENT_ID,
  // google_client_secret: process.env.GOOGLE_CLIENT_SECRET,

  // cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  // cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  // diditApiKey: process.env.DIDIT_API_KEY,
  // diditWebhookSecret: process.env.DIDIT_WEBHOOK_SECRET,
  // diditWorkflowId: process.env.DIDIT_WORKFLOW_ID,

  url: {
    base_url: process.env.BASE_URL,
    local_url: process.env.LOCAL_URL,
    vps_url: process.env.VPS_URL,
    frontend_url: process.env.FRONTEND_URL,
  },

  sendgrid_api_key: process.env.SENDGRID_API_KEY,
  email_sender: process.env.EMAIL_SENDER,
  // twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
  // twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  // twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,

  // gatewayApiToken: process.env.GATEWAY_API_TOKEN,
  // gatewayApiSender: process.env.GATEWAY_API_SENDER,

  // aws_access_key: process.env.AWS_ACCESS_KEY,
  // aws_secret_key: process.env.AWS_SECRET_KEY,

  // appleSharedSecret: process.env.APPLE_SHARED_SECRET,

  // revenueCatWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET,

  // revenueCatEnabled: process.env.REVENUECAT_ENABLED === 'true',

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,

  appleClientId: process.env.APPLE_CLIENT_ID,

  gemini_api_key: process.env.GEMINI_API_KEY,

  n8n_webhook_url: process.env.n8n_webhook_url,
};
