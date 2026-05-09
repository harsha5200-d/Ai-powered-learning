import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notesApi, documentsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { BookOpen, RefreshCw, ArrowLeft, FileText } from "lucide-react";

export default function NotesPage() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState("");
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        notesApi.get(docId)
            .then((r) => {
                setNotes(r.data.data.notes);
                setFileName(r.data.data.file_name);
            })
            .catch(() => toast.error("Failed to load notes."))
            .finally(() => setLoading(false));
    }, [docId]);

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const r = await notesApi.regenerate(docId);
            setNotes(r.data.data.notes);
            toast.success("Notes regenerated!");
        } catch {
            toast.error("Failed to regenerate notes.");
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) return <LoadingSpinner fullscreen />;

    return (
        <div className="page container-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <FileText size={17} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="section-title mb-0 truncate">{fileName}</h1>
                    <p className="text-xs text-slate-500">AI-generated study notes</p>
                </div>
                <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="btn-secondary text-sm flex items-center gap-2"
                >
                    <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                    {regenerating ? "Regenerating…" : "Regenerate"}
                </button>
            </div>

            <div className="mt-8">
                {notes ? (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Study Notes</span>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {notes}
                        </div>
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400 mb-4">No notes generated yet.</p>
                        <button onClick={handleRegenerate} disabled={regenerating} className="btn-primary">
                            <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                            {regenerating ? "Generating…" : "Generate Notes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
