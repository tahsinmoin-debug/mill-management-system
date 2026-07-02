"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, Lock, User, ArrowRight, Loader2, Globe } from "lucide-react";
import { useLang, LangProvider } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("login.error"));
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-blue/5 blur-3xl pointer-events-none"></div>

      {/* Language Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLang(lang === "bn" ? "en" : "bn")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-border-primary text-sm font-medium text-text-primary hover:bg-white transition-all shadow-sm"
        >
          <Globe size={16} className="text-accent-cyan" />
          {lang === "bn" ? "English" : "বাংলা"}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-blue p-[2px] mb-4 shadow-lg shadow-accent-cyan/20">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
              <Factory size={32} className="text-accent-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
            {t("login.title")}
          </h1>
          <p className="text-text-muted text-sm px-4">
            {t("login.subtitle")}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 shadow-xl shadow-black/5 animate-slide-in">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            {t("login.welcome")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {t("login.username")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-cyan transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                  placeholder={t("login.username")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {t("login.password")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-cyan transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-bg-input border border-border-primary rounded-xl text-sm text-text-primary focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm font-medium animate-fade-in text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent-cyan/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {t("login.submit")} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-text-muted mt-8">
          &copy; {new Date().getFullYear()} MillTrack. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <LangProvider>
      <LoginForm />
    </LangProvider>
  );
}
