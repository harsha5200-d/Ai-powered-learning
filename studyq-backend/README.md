# StudyQ Backend

Flask REST API for the StudyQ AI-powered study platform.

## Quick Start

### 1. Create & activate a virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL  (Neon PostgreSQL or local)
# - JWT_SECRET_KEY
# - GEMINI_API_KEY
```

### 4. Run the server
```bash
flask run --port 5000
# or
python app.py
```

The API will be available at `http://localhost:5000`. Check `GET /health`.

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user profile |

### Documents
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload` | ✅ | Upload PDF (multipart/form-data, field: `file`) |
| GET | `/api/documents` | ✅ | List user's documents |
| GET | `/api/documents/<id>` | ✅ | Get document + AI notes |

### Quizzes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/quiz/generate/<doc_id>` | ✅ | Generate 10 MCQs from document |
| GET | `/api/quiz/<quiz_id>` | ✅ | Fetch quiz (answers hidden) |
| GET | `/api/quizzes` | ✅ | List user's quizzes |
| POST | `/api/quiz/<quiz_id>/submit` | ✅ | Submit answers, get score |

### Analytics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/summary` | ✅ | Overall stats |
| GET | `/api/analytics/history` | ✅ | All attempt records |
| GET | `/api/analytics/trends` | ✅ | Score trend with rolling avg |

All protected routes require `Authorization: Bearer <jwt>` header.

---

## Project Structure
```
studyq-backend/
├── app.py           # Flask app factory
├── config.py        # Config from env vars
├── models/          # SQLAlchemy models
├── routes/          # Blueprint route handlers
├── services/        # PDF, AI, scoring, analytics logic
├── utils/           # JWT helpers, response formatters
└── requirements.txt
```

## Deployment (Render)
- Set build command: `pip install -r requirements.txt`
- Set start command: `gunicorn app:create_app()`
- Add all `.env` variables as environment variables in Render dashboard
