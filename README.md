# AI-Powered School ERP & LMS

A full-stack School ERP system with role-based portals (Admin, Teacher, Student, Parent) and integrated AI features powered by Google Gemini.

## Structure

```
school-erp-ai/
├── backend/        Node.js + Express + MongoDB API
└── admin-panel/    React + Vite web app (all 4 portals)
```

## Features

**Core ERP:** Student/Teacher/Class management, Attendance, Homework & submissions, Exams & Results, Fee management with Razorpay online payment, Notices & Circulars, Leave applications, Study materials, Direct messaging.

**AI Features (Google Gemini):** AI Doubt Solver, AI Homework Assistant, AI Performance Analysis, AI Report Card Generator, AI Attendance Risk Detection, floating AI Chatbot assistant (available on every page).

## Setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env      # (Mac/Linux: cp .env.example .env)
```

Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string (or local MongoDB)
- `JWT_SECRET` — any long random string
- `GEMINI_API_KEY` — free key from https://aistudio.google.com/app/apikey
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional, for online fee payment (test keys work fine)

```bash
npm run seed     # creates demo accounts + sample data
npm run dev      # starts server on port 5000
```

### 2. Admin Panel (Web App)

```bash
cd admin-panel
npm install
copy .env.example .env
npm run dev      # starts on port 5173
```

Open `http://localhost:5173` in your browser.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |
| Student | student@school.com | student123 |
| Parent | parent@school.com | parent123 |

## Notes

- Both `backend` and `admin-panel` terminals must be running at the same time.
- Study material / notice attachments use plain URL links (Google Drive, Dropbox, etc.) rather than direct file upload, to avoid requiring Cloudinary configuration for a basic setup. Direct file upload via Cloudinary is still available at `POST /api/upload` if you configure the Cloudinary env vars.
- Razorpay is in test mode by default — use Razorpay's test card numbers to try the payment flow.
