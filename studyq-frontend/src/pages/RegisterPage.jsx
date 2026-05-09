import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Brain, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        try {
            await register(form.username, form.email, form.password);
            toast.success("Account created! Let's get started 🚀");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const errData = err.response?.data;
            const msg = errData?.errors
                ? Object.values(errData.errors).join(" ")
                : errData?.message || "Registration failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-900/40">
                        <Brain size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-slate-400 text-sm mt-1">Start studying smarter today</p>
                </div>

                <div className="card-glass">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label" htmlFor="username">
                                <User size={13} className="inline mr-1" />Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                className="input"
                                placeholder="coolstudent123"
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="reg-email">
                                <Mail size={13} className="inline mr-1" />Email
                            </label>
                            <input
                                id="reg-email"
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
                            <label className="label" htmlFor="reg-password">
                                <Lock size={13} className="inline mr-1" />Password
                            </label>
                            <input
                                id="reg-password"
                                name="password"
                                type="password"
                                className="input"
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-400 mt-5">
                        Already have an account?{" "}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
