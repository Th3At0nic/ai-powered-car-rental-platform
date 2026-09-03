# SignBigBang Backend

## 1. Project Overview

SignBigBang is a document management and electronic-signature platform. This repository contains its backend API, built with Node.js, Express, TypeScript, and MongoDB.

## 2. Requirements

- Node.js 18 or later (tested with Node.js 24 LTS)
- MongoDB Community Edition 6 or later, running locally on `127.0.0.1:27017`
- NGINX for reverse proxying and HTTPS termination
- PM2 for process management

## 3. Installation Steps

1. Clone or extract the source code and enter the project directory.
2. Install dependencies:

	```bash
	npm install
	```

3. Create the environment file and fill in every value. The supplied example contains placeholder values for client configuration:

	```bash
	cp .env.example .env
	```

4. Build the TypeScript source into `dist/`:

	```bash
	npm run build
	```

5. Start the API with PM2. The PM2 file must start `dist/server.js` and set the production port to `5209`:

	```bash
	pm2 start ecosystem.config.js
	```

6. Persist the process and configure startup on reboot:

	```bash
	pm2 save
	pm2 startup
	```

## 4. Environment Variables

The table below lists every variable currently present in `.env.example`. Values shown are examples only; replace credentials and secrets with real values. **Required** means the application or the corresponding integration needs the variable in production.

| Variable | Description | Example value |
| --- | --- | --- |
| `NODE_ENV` **(Required)** | Runtime environment. Use `production` on the server. | `production` |
| `PORT` **(Required)** | Local HTTP port. Set to `5209` behind the NGINX configuration below. | `5209` |
| `DATABASE_URL` **(Required)** | MongoDB connection string. | `mongodb://127.0.0.1:27017/signbigbang` |
| `BCRYPT_SALT_ROUND` **(Required)** | Number of bcrypt salt rounds. | `12` |
| `JWT_ACCESS_SECRET` **(Required)** | Secret used to sign access tokens. | `replace-with-a-long-random-secret` |
| `JWT_REFRESH_SECRET` **(Required)** | Secret used to sign refresh tokens. | `replace-with-a-different-long-random-secret` |
| `JWT_ACCESS_EXPIRES_IN` **(Required)** | Access-token lifetime. | `15d` |
| `JWT_REFRESH_EXPIRES_IN` **(Required)** | Refresh-token lifetime. | `90d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. Required when Google sign-in is enabled. | `your-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. Required when Google sign-in is enabled. | `your-google-client-secret` |
| `IMAGE_URL_LOCAL` | Base URL used for local image/file links. | `http://localhost:5001` |
| `IMAGE_URL_VPS` | Public VPS base URL used for image/file links. | `https://api.signbigbang.com` |
| `SENDGRID_API_KEY` | SendGrid API key for email delivery. Required when email delivery is enabled. | `your-sendgrid-api-key` |
| `EMAIL_SENDER` | Verified SendGrid sender address. Required when email delivery is enabled. | `no-reply@signbigbang.com` |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier for SMS. Required when Twilio SMS is enabled. | `your-twilio-account-sid` |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token. Required when Twilio SMS is enabled. | `your-twilio-auth-token` |
| `TWILIO_PHONE_NUMBER` | Twilio sender phone number. | `+1xxxxxxxxxx` |

> The current application configuration also references Stripe, Cloudinary, DiDIT, GatewayAPI, AWS, Apple, RevenueCat, and URL variables such as `BASE_URL` and `FRONTEND_URL`. Add those values to `.env` when the related features are enabled; keep `.env` out of version control.

## 5. MongoDB Setup

Install MongoDB Community Edition 6 or later and ensure the service is running on:

```text
mongodb://127.0.0.1:27017/signbigbang
```

MongoDB must bind to `127.0.0.1` only. Do not expose port `27017` to the public internet.

## 6. NGINX Configuration

Create an NGINX site for `api.signbigbang.com` with the following HTTP reverse-proxy block:

```nginx
server {
	 listen 80;
	 listen [::]:80;
	 server_name api.signbigbang.com;

	 client_max_body_size 100M;

	 location / {
		  proxy_pass http://127.0.0.1:5209;
		  proxy_http_version 1.1;
		  proxy_set_header Host $host;
		  proxy_set_header X-Real-IP $remote_addr;
		  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		  proxy_set_header X-Forwarded-Proto $scheme;
	 }
}
```

Enable the site, test the configuration with `sudo nginx -t`, and reload NGINX. Use Certbot to obtain and install the SSL certificate; it will create or update the HTTPS server block.

## 7. PM2 Configuration

`ecosystem.config.js` should run the compiled server from `dist/server.js` and set `NODE_ENV=production` and `PORT=5209`. From the project root:

```bash
pm2 start ecosystem.config.js
pm2 stop ecosystem.config.js
pm2 restart ecosystem.config.js
pm2 logs
```

Run `npm run build` after source changes, then restart the PM2 process. The repository currently does not include `ecosystem.config.js`; add the deployment-specific file before running the start command.

## 8. API Base URL

Production API base URL: [https://api.signbigbang.com/api/v1](https://api.signbigbang.com/api/v1)

## 9. Key API Endpoints Overview

All route groups are mounted below `/api/v1`. The current source uses these prefixes:

- `/auth` - Authentication, registration, login, and token operations
- `/user` - User profile and account management
- `/document` - Document upload and management
- `/sign-request` - Signing workflow and signing-token operations
- `/signature` - Signature submission
- `/verify` - DiDIT identity verification and webhook handling
- `/subscription` - Subscription plans, subscriptions, and webhooks
- `/dashboard` - Sender and signer dashboards

## 10. Third-Party Services

- **SendGrid** - Email delivery
- **GatewayAPI** - SMS delivery
- **DiDIT** - KYC identity verification
- **RevenueCat** - Subscription management; disabled by default and enabled with `REVENUECAT_ENABLED=true`

## 11. Deep Link Scheme

The mobile application uses `signbigbangapp://` for deep links. Signing links use:

```text
signbigbangapp://validate
```

## 12. Deployment Notes

- Never expose port `5209` publicly; allow NGINX to proxy to it locally.
- Do not expose MongoDB port `27017` publicly.
- Set `NODE_ENV=production` in `.env`.
- Uploaded documents are stored in the `uploads/` folder. Ensure sufficient disk space; at least 20 GB is recommended.
