import { useEffect, useState } from "react";
import { analyticsApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from "recharts";
import { Target, Trophy, Zap, TrendingUp, BookOpen } from "lucide-react";

// Custom tooltip for recharts
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-200 border border-surface-400 rounded-xl px-3 py-2 text-xs shadow-xl">
            <p className="text-slate-400 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value}%
                </p>
            ))}
        </div>
    );
};

function StatCard({ icon: Icon, label, value, sub, iconClass, bgClass }) {
    return (
        <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={iconClass} />
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            analyticsApi.summary(),
            analyticsApi.trends(),
            analyticsApi.history(),
        ])
            .then(([s, t, h]) => {
                setSummary(s.data.data);
                setTrends(t.data.data || []);
                setHistory(h.data.data || []);
            })
            .catch(() => toast.error("Failed to load analytics."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner fullscreen />;

    // Format trend data for chart
    const trendData = trends.map((t) => ({
        name: `#${t.attempt_number}`,
        Accuracy: t.accuracy,
        "Rolling Avg": t.rolling_avg,
    }));

    // Format history for bar chart (last 10)
    const historyData = history.slice(-10).map((h, i) => ({
        name: `Quiz ${i + 1}`,
        Score: Math.round((h.score / h.total_questions) * 100),
    }));

    const noData = trends.length === 0;

    return (
        <div className="page container-lg animate-fade-in">
            <div className="mb-8">
                <h1 className="section-title">Performance Analytics</h1>
                <p className="section-sub">Track your accuracy and improvement over time</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard
                    icon={Zap} label="Total Quizzes" value={summary?.total_quizzes ?? 0}
                    iconClass="text-brand-400" bgClass="bg-brand-500/15"
                />
                <StatCard
                    icon={Target} label="Avg Accuracy" value={`${summary?.average_accuracy ?? 0}%`}
                    iconClass="text-purple-400" bgClass="bg-purple-500/15"
                />
                <StatCard
                    icon={Trophy} label="Best Accuracy" value={`${summary?.best_accuracy ?? 0}%`}
                    iconClass="text-yellow-400" bgClass="bg-yellow-500/15"
                />
                <StatCard
                    icon={BookOpen} label="Total Attempts" value={summary?.total_attempts ?? 0}
                    iconClass="text-emerald-400" bgClass="bg-emerald-500/15"
                />
            </div>

            {noData ? (
                <div className="card text-center py-16">
                    <TrendingUp size={40} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-400 mb-2">No quiz attempts yet.</p>
                    <p className="text-slate-500 text-sm">Complete a quiz to see your analytics here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Accuracy trend line chart */}
                    <div className="card">
                        <h2 className="font-semibold text-white mb-1">Accuracy Trend</h2>
                        <p className="text-slate-500 text-xs mb-5">Per-attempt accuracy vs. rolling average</p>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#272742" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip content={<ChartTooltip />} />
                                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" />
                                <Line
                                    type="monotone" dataKey="Accuracy"
                                    stroke="#6080ff" strokeWidth={2} dot={{ fill: "#6080ff", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone" dataKey="Rolling Avg"
                                    stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="flex gap-5 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-brand-400 inline-block rounded" />Accuracy</span>
                            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-purple-400 inline-block rounded border-dashed" />Rolling Avg</span>
                            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-yellow-400 inline-block rounded opacity-60" />60% threshold</span>
                        </div>
                    </div>

                    {/* Score per quiz bar chart */}
                    <div className="card">
                        <h2 className="font-semibold text-white mb-1">Score Per Quiz</h2>
                        <p className="text-slate-500 text-xs mb-5">Last {historyData.length} quiz attempts</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={historyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#272742" />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="Score" fill="#6080ff" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Attempt history table */}
                    <div className="card overflow-x-auto">
                        <h2 className="font-semibold text-white mb-4">Attempt History</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500 text-left">
                                    <th className="pb-3 pr-4 font-medium">#</th>
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                    <th className="pb-3 pr-4 font-medium">Score</th>
                                    <th className="pb-3 pr-4 font-medium">Accuracy</th>
                                    <th className="pb-3 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-300">
                                {history.map((h, i) => {
                                    const pct = h.accuracy;
                                    const badge =
                                        pct >= 80 ? "badge-green"
                                            : pct >= 60 ? "badge-yellow"
                                                : "badge-red";
                                    return (
                                        <tr key={h.id} className="text-slate-300">
                                            <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                                            <td className="py-3 pr-4">
                                                {new Date(h.attempted_at).toLocaleDateString("en-GB", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </td>
                                            <td className="py-3 pr-4 font-semibold text-white">
                                                {h.score}/{h.total_questions}
                                            </td>
                                            <td className="py-3 pr-4 font-semibold">{pct}%</td>
                                            <td className="py-3">
                                                <span className={badge}>
                                                    {pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : "Needs Work"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
