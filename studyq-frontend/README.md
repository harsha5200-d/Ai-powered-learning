# StudyQ Frontend

React + Vite frontend for the StudyQ AI-powered study platform.

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

Make sure the backend is running at `http://localhost:5000` (or update `.env`).

## Environment Variables

`.env` file (already created):
```
VITE_API_BASE_URL=http://localhost:5000
```

## Key Features
- **Landing Page** — Three.js animated particle network hero
- **Auth** — JWT login/register with persistent sessions
- **Dashboard** — Stats overview, recent documents
- **Upload** — Drag-and-drop PDF uploader → auto notes + quiz generation
- **Documents** — Expandable cards with AI study notes
- **Quiz** — Paginated MCQ interface with answer grid progress tracker
- **Results** — Animated SVG score ring, per-question feedback
- **Analytics** — Recharts line chart (accuracy trends), bar chart (scores), history table

## Tech Stack
- React 18 + Vite
- Tailwind CSS v3 (dark design system)
- Three.js (3D particles)
- Recharts (analytics graphs)
- React Router DOM v6
- Axios (API client with JWT interceptors)
- react-hot-toast (notifications)
- lucide-react (icons)

## Deployment (Vercel)

```bash
npm run build
# Upload dist/ to Vercel, or connect GitHub repo
```

Set `VITE_API_BASE_URL` to your Render backend URL in Vercel environment variables.
