import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { documentsApi, quizApi } from "../services/api";
import toast from "react-hot-toast";
import { Upload, FileText, Loader2, Zap, CheckCircle } from "lucide-react";

export default function UploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [docId, setDocId] = useState(null);

    const handleFile = (f) => {
        if (!f) return;
        if (f.type !== "application/pdf") { toast.error("Only PDF files are supported."); return; }
        if (f.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10 MB."); return; }
        setFile(f);
        setDocId(null);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const handleUpload = async () => {
        if (!file) { toast.error("Please select a PDF first."); return; }
        const fd = new FormData();
        fd.append("file", file);
        setUploading(true);
        try {
            const res = await documentsApi.upload(fd);
            const id = res.data.data.id;
            setDocId(id);
            toast.success("PDF uploaded and notes generated! ✅");
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!docId) return;
        setGenerating(true);
        try {
            const res = await quizApi.generate(docId);
            const quiz = res.data.data;
            toast.success("Quiz generated! 🎉");
            navigate(`/quiz/${quiz.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Quiz generation failed.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="page container-lg max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="section-title">Upload Study Material</h1>
                <p className="section-sub">Upload a PDF to extract notes and generate an AI quiz</p>
            </div>

            {/* Drop zone */}
            <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${dragging ? "border-brand-500 bg-brand-500/10" : "border-surface-400 hover:border-brand-500/50 bg-surface-100"}
          ${file ? "border-brand-500/60" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("file-input").click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center">
                            <FileText size={32} className="text-red-400" />
                        </div>
                        <p className="font-semibold text-white">{file.name}</p>
                        <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            className="text-xs text-slate-500 hover:text-slate-300"
                            onClick={(e) => { e.stopPropagation(); setFile(null); setDocId(null); }}
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center">
                            <Upload size={32} className="text-brand-400" />
                        </div>
                        <p className="font-semibold text-white">Drop your PDF here</p>
                        <p className="text-slate-400 text-sm">or click to browse • Max 10 MB</p>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
                {!docId ? (
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <><Loader2 size={18} className="animate-spin" /> Uploading & generating notes...</>
                        ) : (
                            <><Upload size={18} /> Upload PDF</>
                        )}
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                            <CheckCircle size={16} /> Document uploaded and notes generated successfully!
                        </div>
                        <button
                            onClick={handleGenerateQuiz}
                            disabled={generating}
                            className="btn-primary w-full justify-center py-3 text-base"
                        >
                            {generating ? (
                                <><Loader2 size={18} className="animate-spin" /> Generating Quiz with AI...</>
                            ) : (
                                <><Zap size={18} /> Generate AI Quiz</>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="mt-8 card border-brand-500/20">
                <p className="text-sm font-semibold text-white mb-2">💡 Tips for best results</p>
                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                    <li>Use PDFs with selectable text (not scanned images)</li>
                    <li>Content-heavy PDFs produce better MCQs</li>
                    <li>Academic papers and textbooks work great</li>
                </ul>
            </div>
        </div>
    );
}
