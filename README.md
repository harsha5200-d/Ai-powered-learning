<div align="center">

<img src="https://img.shields.io/badge/StudyQ-AI%20Powered%20Learning-6366f1?style=for-the-badge&logo=sparkles&logoColor=white" alt="StudyQ"/>

# ✨ StudyQ — AI-Powered Learning Platform

**Upload. Learn. Master.**  
Transform any PDF into smart quizzes and deep insights — powered by Google Gemini AI.

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Vercel-black?style=for-the-badge)](https://ai-powered-learning-tau.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️%20Backend-Render-46E3B7?style=for-the-badge)](https://ai-powered-learning-7808.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

---

<img width="800" src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80&auto=format&fit=crop" alt="StudyQ Banner"/>

</div>

---

## 🌟 What is StudyQ?

**StudyQ** is a full-stack AI-powered learning platform where students can upload study materials (PDFs) and instantly receive:

- 📝 **AI-Generated Quizzes** — Multiple choice questions crafted by Gemini AI
- 📊 **Performance Analytics** — Track scores, trends, and progress over time
- 🧠 **Smart Summaries** — Key insights extracted from your documents
- 🔐 **Secure Auth** — JWT-based user authentication

> _"Stop re-reading. Start testing. Learn faster."_

---

## 🎯 Features

| Feature | Description |
|--------|-------------|
| 📤 **PDF Upload** | Upload any study material up to 50MB |
| 🤖 **AI Quiz Generation** | Gemini 2.5 Flash generates contextual MCQs |
| ✅ **Quiz Taking** | Interactive quiz interface with instant feedback |
| 📈 **Analytics Dashboard** | Visual charts of your learning progress |
| 🔒 **Authentication** | Secure register/login with JWT tokens |
| 📱 **Responsive UI** | Beautiful UI that works on all devices |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ORM-880000)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)

### AI & Cloud
![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- Google Gemini API key ([get free key](https://aistudio.google.com))

### 1. Clone the Repository

```bash
git clone https://github.com/harsha5200-d/Ai-powered-learning.git
cd Ai-powered-learning
```

### 2. Setup Backend

```bash
cd studyq-backend
npm install
```

Create `.env` file:

```env
# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/studyq

# JWT
JWT_SECRET_KEY=your-super-secret-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Upload Limit
MAX_CONTENT_LENGTH_MB=50

# CORS
CORS_ORIGINS=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd studyq-frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

---

## 📁 Project Structure

```
Ai-powered-learning/
├── 📂 studyq-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service (api.js)
│   │   └── context/             # Auth context
│   └── vite.config.js
│
└── 📂 studyq-backend/           # Node.js + Express backend
    ├── routes/                  # API routes
    ├── models/                  # Mongoose models
    ├── services/                # Business logic (AI, PDF, etc.)
    ├── middleware/              # Auth middleware
    ├── utils/                   # Helper functions
    └── server.js                # Entry point
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload PDF |
| `GET` | `/api/documents` | List all documents |
| `GET` | `/api/documents/:id` | Get single document |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/quiz/generate/:id` | Generate AI quiz |
| `GET` | `/api/quiz/:id` | Get quiz |
| `POST` | `/api/quiz/:id/submit` | Submit answers |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/summary` | Get summary stats |
| `GET` | `/api/analytics/history` | Get quiz history |
| `GET` | `/api/analytics/trends` | Get score trends |

---

## ☁️ Deployment

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `studyq-frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Env Variable | `VITE_API_URL=https://your-backend.onrender.com` |

### Backend → Render

| Setting | Value |
|---------|-------|
| Root Directory | `studyq-backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

---

## 🔐 Environment Variables

### Backend (Render)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | Secret key for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key |
| `MAX_CONTENT_LENGTH_MB` | Max upload size in MB |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Harsha Vardhan**

[![GitHub](https://img.shields.io/badge/GitHub-harsha5200--d-181717?style=flat&logo=github)](https://github.com/harsha5200-d)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by Harsha Vardhan

⭐ **Star this repo if you found it helpful!** ⭐

</div>
