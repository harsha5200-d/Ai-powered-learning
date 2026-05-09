import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore session
    useEffect(() => {
        const token = localStorage.getItem("studyq_token");
        if (token) {
            authApi
                .me()
                .then((res) => setUser(res.data.data))
                .catch(() => localStorage.removeItem("studyq_token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await authApi.login({ email, password });
        const { token, user: userData } = res.data.data;
        localStorage.setItem("studyq_token", token);
        setUser(userData);
        return userData;
    }, []);

    const register = useCallback(async (username, email, password) => {
        const res = await authApi.register({ username, email, password });
        const { token, user: userData } = res.data.data;
        localStorage.setItem("studyq_token", token);
        setUser(userData);
        return userData;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("studyq_token");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}

export default AuthContext;
