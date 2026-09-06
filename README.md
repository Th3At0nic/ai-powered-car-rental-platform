# DrivePilot — AI-Powered Car Rental Platform

DrivePilot is a modern car rental platform built as part of the Digital Pylot Developer Assessment.

The platform provides a customer-facing car rental experience, a protected admin dashboard for fleet and rental management, an AI-powered vehicle recommendation feature, and an automated rental notification workflow.

---

## Live Demo

**Customer Frontend:**  
[Add deployed frontend URL]

**Admin Dashboard:**  
[Add deployed frontend URL]/admin

**Backend API:**  
[Add deployed backend API URL]

---

## Repository

**GitHub:**  
https://github.com/Th3At0nic/ai-powered-car-rental-platform

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

The backend sends the customer's preferences and the currently available vehicle inventory to Gemini.

The AI recommends the best matching vehicle.

The returned vehicle ID is then validated against the actual MongoDB vehicle inventory before the recommendation is displayed.

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

```text
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
