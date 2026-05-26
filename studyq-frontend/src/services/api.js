import axios from "axios";

// ✅ Correct
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("studyq_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global 401 handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("studyq_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const authApi = {
    register: (data) => api.post("/api/auth/register", data),
    login: (data) => api.post("/api/auth/login", data),
    me: () => api.get("/api/auth/me"),
};

// ── Documents ─────────────────────────────────────────
export const documentsApi = {
    upload: (formData) =>
        api.post("/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    list: () => api.get("/api/documents"),
    get: (id) => api.get(`/api/documents/${id}`),
};

// ── Quizzes ───────────────────────────────────────────
export const quizApi = {
    generate: (docId) => api.post(`/api/quiz/generate/${docId}`),
    get: (quizId) => api.get(`/api/quiz/${quizId}`),
    list: () => api.get("/api/quizzes"),
    submit: (quizId, answers) => api.post(`/api/quiz/${quizId}/submit`, { answers }),
};

// ── Analytics ─────────────────────────────────────────
export const analyticsApi = {
    summary: () => api.get("/api/analytics/summary"),
    history: () => api.get("/api/analytics/history"),
    trends: () => api.get("/api/analytics/trends"),
};

// ── Notes ─────────────────────────────────────────────
export const notesApi = {
    get: (docId) => api.get(`/api/notes/${docId}`),
    regenerate: (docId) => api.post(`/api/notes/${docId}/regenerate`),
};

// ── Flashcards ────────────────────────────────────────
export const flashcardsApi = {
    generate: (docId) => api.post(`/api/flashcards/generate/${docId}`),
};

