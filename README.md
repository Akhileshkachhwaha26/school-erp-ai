<div align="center">

# 🎓 AI-Powered School ERP & LMS

**A full-stack School Management System with role-based portals and integrated AI features**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://school-erp-ai-eight.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

[Live Demo](https://school-erp-ai-eight.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 About

A modern, AI-integrated School ERP & Learning Management System built to digitize daily school operations — attendance, homework, exams, fees, and communication — for **Admins, Teachers, Students, and Parents**, each with their own dedicated portal.


---

## ✨ Features

### 🏫 Core ERP
| Module | Description |
|---|---|
| 👥 Role-based Access | Separate portals for Admin, Teacher, Student, Parent |
| 📋 Attendance | Mark & track daily attendance, class-wise and student-wise |
| 📚 Homework | Assign, submit, and grade assignments |
| 📝 Exams & Results | Schedule exams, publish results, auto-calculated grades |
| 💰 Fee Management | Individual or bulk fee assignment, **online payment via Razorpay** |
| 📢 Notices | School-wide or audience-targeted announcements |
| 🗓️ Leave Management | Apply, review, approve/reject leave requests |
| 📂 Study Materials | Share resources and reference links by class/subject |
| 💬 Messaging | Direct chat between any two users on the platform |

### 🤖 AI Features (Powered by Google Gemini)
| Feature | Description |
|---|---|
| 🧠 AI Doubt Solver | Step-by-step explanations for student questions |
| 📖 AI Homework Assistant | Contextual guidance on assignments without giving away answers |
| 📊 AI Performance Analysis | Attendance + grades + homework trend analysis for parents/teachers |
| 📄 AI Report Card Generator | Auto-generated, professional report card remarks |
| ⚠️ AI Attendance Risk Detection | Flags students below 75% attendance automatically |
| 💬 AI Chatbot | Floating assistant available on every page, for every role |

### 🎨 Experience
- 🌗 **Dark Mode** — toggle across the entire app
- 🌐 **Hindi / English** — bilingual UI toggle
- 🔔 **Push Notifications** — native browser alerts for new notices/homework
- 📄 **PDF Export** — download attendance & result reports
- 📱 Fully responsive, clean, distraction-free UI

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Razorpay (payments)
- Cloudinary (file storage)

**AI**
- Google Gemini API

**Deployment**
- Frontend → [Vercel](https://vercel.com)
- Backend → [Render](https://render.com)
- Database → [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 📁 Project Structure

```
school-erp-ai/
├── backend/              Node.js + Express + MongoDB REST API
│   ├── config/           Database & Cloudinary config
│   ├── controllers/      Business logic per module
│   ├── middleware/       Auth, error handling, file uploads
│   ├── models/           Mongoose schemas
│   ├── routes/           API route definitions
│   └── utils/            Helpers + database seed script
│
└── admin-panel/          React + Vite web app (all 4 portals)
    └── src/
        ├── api/           Axios client
        ├── context/       Auth, Theme, Language providers
        ├── layouts/       Sidebar layouts per role
        ├── pages/         Role-specific and shared pages
        ├── components/    Reusable UI (Chatbot, toggles, etc.)
        ├── hooks/         Custom hooks (push notifications)
        └── utils/         PDF export, helpers
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)

### 1. Clone the repository

```bash
git clone https://github.com/Akhileshkachhwaha26/school-erp-ai.git
cd school-erp-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # then fill in your values — see below
npm run seed             # creates demo accounts + sample data
npm run dev               # starts on http://localhost:5000
```

**Required environment variables** (`backend/.env`):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URLS=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev               # starts on http://localhost:5173
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | `admin@school.com` | `admin123` |
| 👩‍🏫 Teacher | `teacher@school.com` | `teacher123` |
| 🎒 Student | `student@school.com` | `student123` |
| 👨‍👩‍👧 Parent | `parent@school.com` | `parent123` |

> Run `npm run seed` in the `backend` folder to create these accounts.

---

## 🌍 Deployment

| Layer | Platform | 
|---|---|
| Frontend | [Vercel](https://vercel.com) — auto-deploys from `main` branch, root directory `admin-panel` |
| Backend | [Render](https://render.com) — root directory `backend`, build `npm install`, start `npm start` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

**Live App:** [school-erp-ai-eight.vercel.app](https://school-erp-ai-eight.vercel.app)

> ⚠️ Backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle time may take 30–50 seconds to respond while it wakes up.

---

## 🗺️ Roadmap

- [ ] Online Exams / Auto-graded Quizzes
- [ ] Class Timetable / Schedule Management
- [ ] Admin Analytics Dashboard (trends & insights)
- [ ] Library Management (book issue/return)
- [ ] Bulk student import via CSV/Excel

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](../../issues).

## 📄 License

This project is open source and available for educational and personal use.

---

<div align="center">

Built with ❤️ using React, Node.js, MongoDB, and Google Gemini

</div>
