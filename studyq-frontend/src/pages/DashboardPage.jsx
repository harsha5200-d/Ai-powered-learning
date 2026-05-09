import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { documentsApi, quizApi, analyticsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { Upload, BookOpen, Target, Trophy, ArrowRight, Clock, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-15 flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color.replace("bg-", "text-").replace("/15", "").replace("bg-", "text-")} />
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [docs, setDocs] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            documentsApi.list(),
            quizApi.list(),
            analyticsApi.summary(),
        ]).then(([d, q, s]) => {
            setDocs(d.data.data || []);
            setQuizzes(q.data.data || []);
            setSummary(s.data.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner fullscreen />;

    return (
        <div className="page container-lg animate-fade-in">
            {/* Welcome */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white">
                    Welcome back, <span className="text-brand-400">{user?.username}</span> 👋
                </h1>
                <p className="text-slate-400 mt-1">Here's your study overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard icon={BookOpen} label="Documents" value={docs.length} color="bg-brand-500/15 text-brand-400" />
                <StatCard icon={Zap} label="Quizzes" value={quizzes.length} color="bg-purple-500/15 text-purple-400" />
                <StatCard icon={Target} label="Avg Accuracy" value={`${summary?.average_accuracy ?? 0}%`} color="bg-emerald-500/15 text-emerald-400" />
                <StatCard icon={Trophy} label="Best Score" value={summary?.best_score ?? 0} color="bg-yellow-500/15 text-yellow-400" />
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <Link to="/upload" className="card group hover:border-brand-500/40 transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center">
                        <Upload size={22} className="text-brand-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white">Upload a new PDF</p>
                        <p className="text-xs text-slate-400 mt-0.5">Extract text and generate a quiz</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                </Link>
                <Link to="/analytics" className="card group hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                        <Target size={22} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-white">View Analytics</p>
                        <p className="text-xs text-slate-400 mt-0.5">Track your improvement over time</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                </Link>
            </div>

            {/* Recent documents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Recent Documents</h2>
                    <Link to="/documents" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
                </div>
                {docs.length === 0 ? (
                    <div className="card text-center py-12">
                        <BookOpen size={36} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No documents yet.</p>
                        <Link to="/upload" className="btn-primary mt-4 inline-flex">Upload your first PDF</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {docs.slice(0, 5).map((doc) => (
                            <div key={doc.id} className="card flex items-center gap-4 hover:border-surface-400 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                                    <BookOpen size={18} className="text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{doc.file_name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <Clock size={11} />
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                        {" · "}{doc.quiz_count} quiz{doc.quiz_count !== 1 ? "zes" : ""}
                                    </p>
                                </div>
                                <Link to={`/documents?id=${doc.id}`} className="btn-ghost text-xs">View</Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
