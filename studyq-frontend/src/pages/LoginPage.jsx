import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Brain, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error("Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success("Welcome back! 🎉");
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-900/40">
                        <Brain size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-slate-400 text-sm mt-1">Sign in to your StudyQ account</p>
                </div>

                <div className="card-glass">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label" htmlFor="email">
                                <Mail size={13} className="inline mr-1" />Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="password">
                                <Lock size={13} className="inline mr-1" />Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-5">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                            Sign up free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
