import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "").replace(/\/[^/]*$/, "");
const TOKEN_KEY = "tvd_admin_token";

type AuthState = {
  token: string | null;
  username: string | null;
  isChecking: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setIsChecking(false); return; }
    fetch(`${API_BASE}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => {
        if (r.ok) {
          try {
            const { username: u } = JSON.parse(atob(stored.replace(/-/g, "+").replace(/_/g, "/")));
            setToken(stored);
            setUsername(u);
          } catch { localStorage.removeItem(TOKEN_KEY); }
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsChecking(false));
  }, []);

  const login = async (user: string, pass: string): Promise<string | null> => {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const data = await r.json();
    if (!r.ok) return data.error ?? "خطأ في تسجيل الدخول";
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUsername(data.username);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, isChecking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
