import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, BarChart2, RotateCcw } from "lucide-react";

// Animated SVG score ring
function ScoreRing({ score, total }) {
    const pct = total > 0 ? score / total : 0;
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;

    const color =
        pct >= 0.8 ? "#10b981"  // emerald
            : pct >= 0.5 ? "#f59e0b"  // yellow
                : "#ef4444";               // red

    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#1e1e36" strokeWidth="10" />
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 1s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{score}</span>
                <span className="text-slate-400 text-sm">/ {total}</span>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, quiz } = location.state || {};

    if (!result) {
        return (
            <div className="page container-lg text-center">
                <p className="text-slate-400">No result data found.</p>
                <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
            </div>
        );
    }

    const { score, total_questions, accuracy, feedback } = result;
    const grade =
        accuracy >= 80 ? { label: "Excellent! 🎉", color: "text-emerald-400" }
            : accuracy >= 60 ? { label: "Good Job! 👍", color: "text-yellow-400" }
                : { label: "Keep Practicing! 💪", color: "text-red-400" };

    return (
        <div className="page container-lg max-w-3xl animate-fade-in">
            {/* Score hero */}
            <div className="card text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h1>
                <p className={`text-lg font-semibold mb-6 ${grade.color}`}>{grade.label}</p>
                <ScoreRing score={score} total={total_questions} />
                <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{accuracy}%</p>
                        <p className="text-slate-400 text-sm">Accuracy</p>
                    </div>
                    <div className="w-px h-8 bg-surface-300" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{score}</p>
                        <p className="text-slate-400 text-sm">Correct</p>
                    </div>
                    <div className="w-px h-8 bg-surface-300" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{total_questions - score}</p>
                        <p className="text-slate-400 text-sm">Wrong</p>
                    </div>
                </div>
            </div>

            {/* Per-question review */}
            <div className="mb-8">
                <h2 className="section-title mb-4">Question Review</h2>
                <div className="space-y-3">
                    {feedback.map((item, idx) => (
                        <div
                            key={item.question_id}
                            className={`card border ${item.is_correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}
                        >
                            <div className="flex items-start gap-3">
                                {item.is_correct
                                    ? <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white mb-1">
                                        Q{idx + 1}: {item.question_text}
                                    </p>
                                    {!item.is_correct && (
                                        <div className="flex flex-wrap gap-3 text-xs mt-1">
                                            <span className="badge-red">Your answer: {item.submitted || "—"}</span>
                                            <span className="badge-green">Correct: {item.correct}</span>
                                        </div>
                                    )}
                                    {item.is_correct && (
                                        <span className="badge-green text-xs">Correct ✓</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <Link to="/analytics" className="btn-primary">
                    <BarChart2 size={16} /> View Analytics
                </Link>
                <Link to="/upload" className="btn-secondary">
                    <RotateCcw size={16} /> New Quiz
                </Link>
                <Link to="/dashboard" className="btn-ghost">Back to Dashboard</Link>
            </div>
        </div>
    );
}
