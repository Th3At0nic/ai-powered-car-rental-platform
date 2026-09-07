# DrivePilot — AI-Powered Car Rental Platform

DrivePilot is a modern car rental platform built as part of the Digital Pylot Developer Assessment.

The platform provides a customer-facing car rental experience, a protected admin dashboard for fleet and rental management, an AI-powered vehicle recommendation feature, and an automated rental notification workflow.

---

## Live Demo

**Customer Frontend:**
[https://drive-pilot-frontend.vercel.app]

**Admin Dashboard:**
[https://drive-pilot-frontend.vercel.app/admin/dashboard]

- **Email:** `admin@example.com`
- **Password:** `Password123!`

**Backend API:**
[https://drive-pilot-server.vercel.app]

---

## Repository

**GitHub:**
https://github.com/Th3At0nic/ai-powered-car-rental-platform

---

### Admin Demo Credentials

For assessment testing and administrative access:

- **Email:** `admin@example.com`
- **Password:** `Password123!`

---

## Main Features

### Customer Frontend

- Modern responsive car rental homepage
- Vehicle browsing and category filtering
- Vehicle search
- Vehicle details page
- Rental booking flow
- Customer registration and login
- Protected customer routes
- My Rentals page
- Rental status tracking
- Responsive desktop, tablet, and mobile layouts

### Admin Dashboard

- Protected admin dashboard
- Fleet statistics
- Available vehicle statistics
- Rental statistics
- Pending rental overview
- Popular vehicle information
- Recent rental activity
- Rental status breakdown
- Rental activity chart
- Responsive dashboard layout

### AI Vehicle Recommendation

DrivePilot includes an AI-powered vehicle recommendation assistant using the Google Gemini API.

Customers can describe their requirements in natural language, for example:

> "I need a comfortable hybrid SUV for a family of 5. I want something reasonably priced."

The backend sends the customer's preferences and the currently available vehicle inventory to Gemini. The AI recommends the best matching vehicle, and the returned vehicle ID is validated against the actual MongoDB vehicle inventory before the recommendation is displayed.

The customer receives:

- Recommended vehicle
- Real vehicle information from the database
- AI-generated explanation
- Link to the vehicle details page
- Option to request another recommendation

The AI is therefore used for recommendation reasoning while the database remains the source of truth for available vehicles.

### Automation Workflow

DrivePilot uses n8n for rental notification automation.

When a rental is successfully created:

```
Customer creates rental
        ↓
DrivePilot backend
        ↓
n8n webhook
        ↓
Rental data formatting
        ↓
Telegram notification
```

The automated Telegram notification contains complete reservation details, including:

- Customer Name & Email
- Vehicle details (Brand, Name, Category, Fuel Type, Transmission)
- Pickup & Drop-off Locations
- Pickup & Drop-off Dates
- Rental Duration & Daily Pricing
- Total Amount
- Rental Status & Rental ID

The automation is decoupled as a secondary non-blocking process so that temporary webhook failures never impact database transactions or booking confirmation.

---

## Technology Stack

| Layer          | Technologies                                                                        |
| -------------- | ----------------------------------------------------------------------------------- |
| **Frontend**   | React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, RTK Query, Ant Design         |
| **Backend**    | Node.js, Express.js, TypeScript, MongoDB, Mongoose, Zod, JWT Authentication, bcrypt |
| **AI**         | Google Gemini API (gemini-3.6-flash)                                                |
| **Automation** | n8n Community Edition, Telegram Bot API                                             |

---

## System Architecture

```
                 ┌─────────────────────┐
                 │     MongoDB Atlas   │
                 └──────────┬──────────┘
                            │
┌─────────────────┐   ┌─────▼───────────┐
│  React Frontend │──▶│ Express Backend │
└─────────────────┘   └───────┬─────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼──────┐               ┌──────▼───────┐
         │ Gemini API  │               │      n8n     │
         │ AI Vehicle  │               │  Automation  │
         │ Recommend.  │               └───────┬──────┘
         └─────────────┘                       │
                                        ┌──────▼───────┐
                                        │   Telegram   │
                                        │ Notification │
                                        └──────────────┘
```

---

## Backend API Architecture

**Base URL:** `/api/v1`

### Main Endpoints

**Authentication:**

- `POST /auth/register`
- `POST /auth/login`

**Vehicles:**

- `GET /vehicles` (Supports filtering, searching, sorting, and pagination)
- `GET /vehicles/:id`

**Rentals:**

- `POST /rentals`
- `GET /rentals/my-rentals`
- `GET /rentals/:id`
- `PATCH /rentals/cancel/:id`
- `GET /rentals` (Admin)
- `PATCH /rentals/status/:id` (Admin)

**AI Recommendation:**

- `POST /ai/recommend`

**AI Request Payload:**

```json
{
  "preferences": "I need a comfortable hybrid SUV for a family of 5."
}
```

**AI Response Payload:**

```json
{
  "success": true,
  "message": "Vehicle recommendation generated successfully",
  "data": {
    "vehicleId": "6a9aa2a854839a8165acce40",
    "vehicleName": "RAV4",
    "reason": "The Toyota RAV4 is a spacious, highly rated (4.8) 5-seater hybrid SUV that offers a comfortable ride, excellent fuel economy, and great value at $78/day."
  }
}
```

---

## Project Structure

```
digital-pylot-assesment/
│
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── customer/
│       │   ├── form/
│       │   └── layout/
│       ├── pages/
│       │   ├── admin/
│       │   └── user/
│       ├── redux/
│       │   ├── api/
│       │   └── features/
│       ├── routes/
│       ├── types/
│       └── utils/
│
├── backend/
│   └── src/
│       └── app/
│           ├── config/
│           ├── middlewares/
│           ├── modules/
│           │   ├── auth/
│           │   ├── user/
│           │   ├── vehicle/
│           │   ├── rental/
│           │   └── ai/
│           └── routes/
│
├── automation/
│   └── n8n-booking-workflow.json
│
└── README.md
```

---

## Local Development

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables

Environment variables are excluded from version control. Configure your `backend/.env`:

```
NODE_ENV=
PORT=5001
DATABASE_URL=your_mongodb_connection_string
BCRYPT_SALT_ROUND=
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=15d
JWT_REFRESH_EXPIRES_IN=90d
GEMINI_API_KEY=your_gemini_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/drivepilot-rental-created
```

---

## Authentication & Roles

The platform uses JWT-based authentication supporting two primary roles:

- **user**: Can browse, use AI recommendations, make bookings, and view personal rental histories.
- **admin**: Has restricted access to the fleet management dashboard, inventory updates, and overall booking metrics.

---

## Assessment Coverage Summary

- **Customer Front-End:** Modern responsive UI, search/filtering, details, booking flow.
- **Admin Dashboard:** Statistics, charts, metrics, and protected routing.
- **AI Vehicle Recommendation:** Integrated gemini-3.6-flash parsing user intent against live MongoDB inventory.
- **API & Backend:** Clean Express architecture, Zod validation, JWT security, Mongoose schemas.
- **Automation Workflow:** Event-driven n8n POST webhook triggering Telegram administrative alerts.
