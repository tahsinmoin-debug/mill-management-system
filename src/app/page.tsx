"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Factory, Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
import { authenticate } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      
      const errorMessage = await authenticate(undefined, formData);
      if (errorMessage) {
        setError(errorMessage);
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_60%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-blue shadow-lg shadow-accent-cyan/20 mb-4">
            <Factory size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1">MillTrack</h1>
          <p className="text-sm text-text-muted">
            Production & Wage Management System
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Welcome back
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border-primary bg-bg-input text-accent-cyan focus:ring-accent-cyan/30"
                />
                <span className="text-xs text-text-muted">Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-lg text-sm
                hover:shadow-lg hover:shadow-accent-cyan/20 active:scale-[0.98] transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-4 border-t border-border-primary">
            <p className="text-[11px] text-text-muted text-center">
              Demo credentials:{" "}
              <code className="px-1.5 py-0.5 bg-bg-secondary rounded text-accent-cyan">
                admin/admin
              </code>{" "}
              or{" "}
              <code className="px-1.5 py-0.5 bg-bg-secondary rounded text-accent-cyan">
                manager/manager
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          © {new Date().getFullYear()} MillTrack. Clothing Mill Production & Wage Management.
        </p>
      </div>
    </div>
  );
}
