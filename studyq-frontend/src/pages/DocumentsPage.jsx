import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { documentsApi, quizApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { BookOpen, Clock, Zap, FileText, ChevronDown, ChevronUp, Loader2, Layers, BookMarked } from "lucide-react";

function DocumentCard({ doc }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async (e) => {
        e.stopPropagation();
        setGenerating(true);
        try {
            const res = await quizApi.generate(doc.id);
            toast.success("Quiz generated!");
            navigate(`/quiz/${res.data.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Generation failed.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="card hover:border-surface-400 transition-colors">
            <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{doc.file_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(doc.uploaded_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric"
                        })}
                        {" · "}{doc.quiz_count} quiz{doc.quiz_count !== 1 ? "zes" : ""}
                    </p>
                </div>
                {expanded ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
            </div>

            {expanded && (
                <div className="mt-4 border-t border-surface-300 pt-4 animate-fade-in">
                    {/* Action buttons */}
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Study Tools</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Notes */}
                        <Link
                            to={`/notes/${doc.id}`}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 text-sm font-medium transition-all"
                        >
                            <BookMarked size={15} />
                            View Notes
                        </Link>

                        {/* Flashcards */}
                        <Link
                            to={`/flashcards/${doc.id}`}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/50 text-violet-300 text-sm font-medium transition-all"
                        >
                            <Layers size={15} />
                            Flashcards
                        </Link>

                        {/* MCQ Quiz */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 text-amber-300 text-sm font-medium transition-all disabled:opacity-60"
                        >
                            {generating
                                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                                : <><Zap size={14} /> Generate MCQ</>
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default function DocumentsPage() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        documentsApi.list()
            .then((r) => setDocs(r.data.data || []))
            .catch(() => toast.error("Failed to load documents."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner fullscreen />;

    return (
        <div className="page container-lg animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-title">My Documents</h1>
                    <p className="section-sub">{docs.length} uploaded · click a card to expand notes</p>
                </div>
                <Link to="/upload" className="btn-primary text-sm">
                    <Zap size={15} /> Upload New
                </Link>
            </div>

            {docs.length === 0 ? (
                <div className="card text-center py-16">
                    <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400 mb-4">No documents uploaded yet.</p>
                    <Link to="/upload" className="btn-primary">Upload your first PDF</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {docs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
            )}
        </div>
    );
}
