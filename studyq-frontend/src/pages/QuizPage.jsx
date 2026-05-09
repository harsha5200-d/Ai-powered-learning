import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";

const OPTION_KEYS = ["a", "b", "c", "d"];
const OPTION_LABELS = ["A", "B", "C", "D"];

function QuestionCard({ question, index, total, selected, onSelect }) {
    return (
        <div className="animate-slide-up">
            {/* Progress */}
            <div className="flex items-center justify-between mb-3 text-sm text-slate-400">
                <span>Question {index + 1} of {total}</span>
                <span>{Math.round(((index + 1) / total) * 100)}%</span>
            </div>
            <div className="w-full bg-surface-300 rounded-full h-1.5 mb-6">
                <div
                    className="bg-gradient-to-r from-brand-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${((index + 1) / total) * 100}%` }}
                />
            </div>

            {/* Question */}
            <div className="card mb-4">
                <p className="text-lg font-medium text-white leading-relaxed">{question.question_text}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {OPTION_KEYS.map((key, i) => {
                    const value = question[`option_${key}`];
                    const label = OPTION_LABELS[i];
                    const isSelected = selected === label;
                    return (
                        <button
                            key={key}
                            onClick={() => onSelect(String(question.id), label)}
                            className={`quiz-option w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all
                ${isSelected
                                    ? "border-brand-500 bg-brand-500/15 text-white"
                                    : "border-surface-400 bg-surface-100 text-slate-300 hover:border-brand-500/40 hover:bg-surface-200"}`}
                        >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                ${isSelected ? "bg-brand-500 text-white" : "bg-surface-300 text-slate-400"}`}>
                                {label}
                            </span>
                            <span className="text-sm leading-relaxed">{value}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function QuizPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});   // {question_id: "A"|"B"|...}
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        quizApi.get(quizId)
            .then((r) => setQuiz(r.data.data))
            .catch(() => toast.error("Failed to load quiz."))
            .finally(() => setLoading(false));
    }, [quizId]);

    if (loading) return <LoadingSpinner fullscreen />;
    if (!quiz) return null;

    const questions = quiz.questions || [];
    const q = questions[current];
    const answered = Object.keys(answers).length;

    const handleSelect = (qId, label) => setAnswers((prev) => ({ ...prev, [qId]: label }));

    const handleSubmit = async () => {
        if (answered < questions.length) {
            const unanswered = questions.length - answered;
            if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
        }
        setSubmitting(true);
        try {
            const res = await quizApi.submit(quizId, answers);
            const result = res.data.data;
            toast.success(`Quiz submitted! Score: ${result.score}/${result.total_questions}`);
            // Pass result via navigation state to avoid extra API call
            navigate(`/results/${result.attempt_id}`, { state: { result, quiz } });
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page container-lg max-w-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-title">Quiz Time! 🧠</h1>
                    <p className="section-sub">{answered} of {questions.length} answered</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors
                ${i === current ? "bg-brand-500 text-white" :
                                    answers[String(questions[i].id)] ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                        "bg-surface-200 text-slate-500"}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question */}
            <QuestionCard
                key={q.id}
                question={q}
                index={current}
                total={questions.length}
                selected={answers[String(q.id)]}
                onSelect={handleSelect}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="btn-secondary disabled:opacity-30"
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                {current < questions.length - 1 ? (
                    <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                        {submitting
                            ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                            : <><Send size={16} /> Submit Quiz</>}
                    </button>
                )}
            </div>
        </div>
    );
}
