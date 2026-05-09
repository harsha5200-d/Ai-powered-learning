import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { flashcardsApi } from "../services/api";
import toast from "react-hot-toast";
import { Layers, ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Zap } from "lucide-react";

function Flashcard({ card, index, total }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Card {index + 1} of {total}</p>

            {/* Flip card */}
            <div
                className="w-full max-w-2xl cursor-pointer"
                style={{ perspective: "1000px" }}
                onClick={() => setFlipped(!flipped)}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "260px",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* Front */}
                    <div style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden" }}>
                        <div className="card h-full flex flex-col items-center justify-center text-center border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent">
                            <div className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">Question / Term</div>
                            <p className="text-xl font-semibold text-white leading-snug">{card.front}</p>
                            <p className="text-xs text-slate-500 mt-6">Click to reveal answer</p>
                        </div>
                    </div>

                    {/* Back */}
                    <div style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                        <div className="card h-full flex flex-col items-center justify-center text-center border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Answer / Definition</div>
                            <p className="text-base text-slate-200 leading-relaxed">{card.back}</p>
                            <p className="text-xs text-slate-500 mt-6">Click to flip back</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FlashcardsPage() {
    const { docId } = useParams();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(0);

    const handleGenerate = async () => {
        setLoading(true);
        setCurrent(0);
        try {
            const r = await flashcardsApi.generate(docId);
            setCards(r.data.data.flashcards);
            setFileName(r.data.data.file_name);
            toast.success("Flashcards generated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Generation failed.");
        } finally {
            setLoading(false);
        }
    };

    const prev = () => setCurrent((c) => Math.max(0, c - 1));
    const next = () => setCurrent((c) => Math.min(cards.length - 1, c + 1));

    return (
        <div className="page container-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <Layers size={17} className="text-violet-400" />
                </div>
                <div className="flex-1">
                    <h1 className="section-title mb-0">{fileName || "Flashcards"}</h1>
                    <p className="text-xs text-slate-500">AI-generated study flashcards</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-primary text-sm flex items-center gap-2"
                >
                    {loading
                        ? <><RotateCcw size={14} className="animate-spin" /> Generating…</>
                        : <><Zap size={14} /> {cards.length ? "Regenerate" : "Generate Flashcards"}</>
                    }
                </button>
            </div>

            {cards.length === 0 && !loading && (
                <div className="card text-center py-20">
                    <Layers size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2 text-lg font-medium">No flashcards yet</p>
                    <p className="text-slate-500 text-sm mb-6">Click "Generate Flashcards" to create 10 AI-powered cards from your document</p>
                    <button onClick={handleGenerate} disabled={loading} className="btn-primary">
                        <Zap size={14} /> Generate Flashcards
                    </button>
                </div>
            )}

            {cards.length > 0 && (
                <div className="space-y-6">
                    <Flashcard card={cards[current]} index={current} total={cards.length} />

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={prev}
                            disabled={current === 0}
                            className="btn-secondary disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Dot indicators */}
                        <div className="flex gap-1.5">
                            {cards.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-violet-400 w-4" : "bg-slate-600"}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            disabled={current === cards.length - 1}
                            className="btn-secondary disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
