# StudyQ - AI Powered Study Assistant

## 1. Project Overview

StudyQ is an AI-powered study platform that allows students to:

- Register and login
- Upload PDF study materials
- Automatically generate:
  - MCQs
  - Notes
  - Flashcards
- Attempt quizzes
- View performance analytics
- Track improvement over time

The system uses LLM APIs for content generation and PostgreSQL for structured storage.

---

## 2. Tech Stack

Frontend:
- React.js
- Tailwind CSS
- Three.js (for landing page 3D elements)
- Recharts (for analytics graphs)

Backend:
- Flask (REST API)
- JWT Authentication
- SQLAlchemy ORM

Database:
- PostgreSQL

AI:
- LLM API (OpenAI / Gemini)
- Prompt-engineered MCQ/Notes generation

PDF Processing:
- PyMuPDF (fitz)

Deployment:
- Frontend → Vercel
- Backend → Render
- Database → Neon PostgreSQL

---

## 3. System Architecture

Frontend (React)
        ↓
Flask REST API
        ↓
Services Layer
    ├── PDF Processing Service
    ├── AI Generation Service
    ├── Quiz Evaluation Service
    └── Analytics Service
        ↓
PostgreSQL Database
        ↓
External LLM API

---

## 4. Backend Folder Structure

studyq-backend/
│
├── app.py
├── config.py
│
├── routes/
│   ├── auth_routes.py
│   ├── upload_routes.py
│   ├── quiz_routes.py
│   └── analytics_routes.py
│
├── models/
│   ├── user.py
│   ├── document.py
│   ├── quiz.py
│   ├── question.py
│   ├── attempt.py
│
├── services/
│   ├── pdf_service.py
│   ├── ai_service.py
│   ├── scoring_service.py
│   └── analytics_service.py
│
├── utils/
│   ├── jwt_utils.py
│   └── helpers.py
│
└── requirements.txt

---

## 5. Database Schema Design

User
- id (PK)
- username
- email
- password_hash
- created_at

Document
- id (PK)
- user_id (FK)
- file_name
- extracted_text
- uploaded_at

Quiz
- id (PK)
- user_id (FK)
- document_id (FK)
- created_at

Question
- id (PK)
- quiz_id (FK)
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_answer

Attempt
- id (PK)
- user_id (FK)
- quiz_id (FK)
- score
- total_questions
- attempted_at

---

## 6. Feature Implementation Order

Phase 1 – Core Setup
1. Setup Flask project
2. Configure PostgreSQL
3. Setup JWT authentication
4. Create user registration & login APIs

Phase 2 – PDF Upload
5. Create upload endpoint
6. Extract text using PyMuPDF
7. Store extracted text in DB

Phase 3 – AI Generation
8. Create AI service for MCQ generation
9. Design structured JSON output format
10. Store generated quiz in DB

Phase 4 – Quiz Attempt
11. Create quiz fetch API
12. Create submit answers API
13. Calculate score
14. Store attempt data

Phase 5 – Analytics
15. Create performance analytics endpoint
16. Calculate:
    - Accuracy %
    - Attempt history
    - Improvement trend
17. Send data to frontend for graph rendering

Phase 6 – UI Integration
18. Connect React frontend to backend
19. Implement dashboard
20. Implement analytics graphs

---

## 7. AI Prompt Design (MCQ Generation)

Prompt Requirements:
- Generate 10 MCQs
- 4 options per question
- One correct answer
- Output in strict JSON format
- No explanations
- Academic tone

The backend must validate the JSON response before saving.

---

## 8. Security Requirements

- JWT protected routes
- Password hashing using bcrypt
- LLM API key stored in environment variables
- File size limits for PDF uploads
- Input validation on all endpoints

---

## 9. Future Enhancements

- Flashcard spaced repetition algorithm
- AI chatbot for doubts
- Weak topic detection
- Leaderboard system
- Export notes as PDF
- Subscription model

---

## 10. Goal

Build a scalable, production-ready AI study platform
that demonstrates full-stack engineering,
LLM integration, and analytics design.