import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brain, LayoutDashboard, Upload, BookOpen, BarChart2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/upload", icon: Upload, label: "Upload" },
    { to: "/documents", icon: BookOpen, label: "Documents" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
                {/* Logo */}
                <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg">
                    <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                        <Brain size={18} className="text-white" />
                    </span>
                    <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                        StudyQ
                    </span>
                </Link>

                {/* Desktop nav */}
                {user && (
                    <div className="hidden md:flex items-center gap-1 ml-6">
                        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname.startsWith(to)
                                        ? "bg-brand-500/20 text-brand-400"
                                        : "text-slate-400 hover:text-white hover:bg-surface-200"}`}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex-1" />

                {/* Auth buttons */}
                {user ? (
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-sm text-slate-400">
                            Hey, <span className="text-white font-medium">{user.username}</span>
                        </span>
                        <button onClick={handleLogout} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/login" className="btn-ghost">Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </div>
                )}

                {/* Mobile hamburger */}
                <button className="md:hidden text-slate-400" onClick={() => setOpen(!open)}>
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-surface-100 border-t border-surface-300 px-4 py-4 space-y-1">
                    {user ? (
                        <>
                            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                                <Link
                                    key={to} to={to}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-surface-200"
                                >
                                    <Icon size={15} /> {label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Login</Link>
                            <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-brand-400">Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
