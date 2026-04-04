import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Plane, Loader2, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(username, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Travel Valet</h1>
            <p className="text-muted-foreground text-sm mt-1">لوحة التحكم</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">تسجيل الدخول</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              required
              autoFocus
              dir="ltr"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة السر</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة السر"
                required
                dir="ltr"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold
                       hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
