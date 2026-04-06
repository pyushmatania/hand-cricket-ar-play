import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import handCricketLogo from "@/assets/hand-cricket-logo.png";

/* ── V11 Wooden Gate Material Constants ── */
const WOOD_BG = "linear-gradient(180deg, #1A0E05 0%, #0D0704 100%)";
const WOOD_CARD = "linear-gradient(180deg, #5C3A1E 0%, #3E2410 100%)";
const ROPE_DIVIDER = "repeating-linear-gradient(90deg, #8B7355 0px, #8B7355 8px, transparent 8px, transparent 14px)";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName || "Player" },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "linear-gradient(180deg, #3E2410, #5C3A1E)",
    border: "2px solid #4A2810",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4"
      style={{ background: WOOD_BG }}>
      {/* Wood grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "url('/assets/ui/wood-plank-texture.png')", backgroundRepeat: "repeat" }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(13,7,4,0.7) 100%)" }} />
      {/* Golden glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.2 }}
          >
            <img
              src={handCricketLogo}
              alt="Hand Cricket"
              className="mx-auto w-48 max-w-[60vw] drop-shadow-2xl mb-3"
              style={{ filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(255,215,0,0.1))" }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-[10px] font-display tracking-[0.3em] mt-2"
            style={{ color: "hsl(43 70% 50% / 0.6)" }}
          >
            {isLogin ? "WELCOME BACK, CHAMPION" : "JOIN THE ARENA"}
          </motion.p>
        </div>

        {/* Auth Card — Stadium Concrete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: CONCRETE_CARD,
            border: "2px solid hsl(220 15% 18%)",
            borderBottom: "5px solid hsl(220 15% 8%)",
            boxShadow: "0 8px 32px hsl(0 0% 0% / 0.5)",
          }}
        >
          {/* Chrome line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(43 90% 55% / 0.3), transparent)" }} />

          {/* Tab Switcher — Jersey Mesh */}
          <div className="flex gap-1 mb-6 rounded-xl p-1"
            style={{
              background: "linear-gradient(180deg, hsl(220 12% 10%), hsl(220 12% 8%))",
              border: "1px solid hsl(220 15% 14%)",
            }}>
            {[
              { key: true, label: "SIGN IN", icon: "⚡" },
              { key: false, label: "SIGN UP", icon: "🚀" },
            ].map((tab) => (
              <button
                key={String(tab.key)}
                type="button"
                onClick={() => { setIsLogin(tab.key); setError(""); setSuccess(""); }}
                className="flex-1 py-2.5 rounded-lg font-display text-[9px] tracking-widest flex items-center justify-center gap-1.5 relative overflow-hidden"
                style={isLogin === tab.key ? {
                  background: "linear-gradient(180deg, hsl(207 90% 50%), hsl(207 85% 38%))",
                  color: "white",
                  borderBottom: "3px solid hsl(207 70% 28%)",
                  boxShadow: "0 2px 8px hsl(207 90% 50% / 0.3)",
                } : {
                  color: "hsl(220 15% 45%)",
                  borderBottom: "3px solid transparent",
                }}
              >
                {isLogin === tab.key && (
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
                )}
                <span className="text-xs relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div key="name-field"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                  <label className="text-[9px] font-display tracking-widest block mb-1.5" style={{ color: "hsl(220 15% 45%)" }}>
                    DISPLAY NAME
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">👤</span>
                    <input
                      type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-body placeholder:text-muted-foreground/30 focus:outline-none transition-all"
                      style={inputStyle} placeholder="Your player name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[9px] font-display tracking-widest block mb-1.5" style={{ color: "hsl(220 15% 45%)" }}>
                EMAIL
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">📧</span>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-body placeholder:text-muted-foreground/30 focus:outline-none transition-all"
                  style={inputStyle} placeholder="player@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-display tracking-widest block mb-1.5" style={{ color: "hsl(220 15% 45%)" }}>
                PASSWORD
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">🔒</span>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm font-body placeholder:text-muted-foreground/30 focus:outline-none transition-all"
                  style={inputStyle} placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "hsl(4 50% 20% / 0.3)", border: "1.5px solid hsl(4 60% 40% / 0.3)" }}>
                  <span className="text-sm">⚠️</span>
                  <span className="text-[10px] font-display" style={{ color: "hsl(4 90% 65%)" }}>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "hsl(142 30% 18% / 0.3)", border: "1.5px solid hsl(142 50% 35% / 0.3)" }}>
                  <span className="text-sm">✅</span>
                  <span className="text-[10px] font-display" style={{ color: "hsl(142 71% 55%)" }}>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit — Jersey Mesh */}
            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.95, y: 2 }}
              className="w-full py-3.5 rounded-2xl font-display text-sm tracking-wider relative overflow-hidden disabled:opacity-50"
              style={{
                background: "linear-gradient(180deg, hsl(142 71% 50%) 0%, hsl(142 65% 38%) 100%)",
                border: "2px solid hsl(142 60% 55% / 0.5)",
                borderBottom: "6px solid hsl(142 55% 25%)",
                color: "hsl(142 80% 98%)",
                textShadow: "0 2px 0 hsl(142 50% 20%)",
                boxShadow: "0 6px 24px hsl(142 71% 45% / 0.3), inset 0 1px 0 hsl(142 80% 65% / 0.4)",
              }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 0.5px, transparent 0.5px)", backgroundSize: "4px 4px" }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>⏳</motion.span>
                    LOADING...
                  </>
                ) : isLogin ? (
                  <><span>⚡</span> SIGN IN</>
                ) : (
                  <><span>🚀</span> CREATE ACCOUNT</>
                )}
              </span>
            </motion.button>

            {/* Chalk divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px opacity-20" style={{ background: CHALK_DIVIDER }} />
              <span className="text-[8px] font-display tracking-widest" style={{ color: "hsl(220 15% 35%)" }}>OR CONTINUE WITH</span>
              <div className="flex-1 h-px opacity-20" style={{ background: CHALK_DIVIDER }} />
            </div>

            {/* Google — Stadium Concrete button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={async () => {
                setError("");
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  setError(result.error.message || "Google sign-in failed");
                }
              }}
              className="w-full py-3 rounded-2xl font-display text-xs tracking-wider flex items-center justify-center gap-2.5"
              style={{
                background: CONCRETE_CARD,
                border: "2px solid hsl(220 15% 18%)",
                borderBottom: "5px solid hsl(220 15% 8%)",
                color: "hsl(var(--foreground))",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              GOOGLE
            </motion.button>
          </form>
        </motion.div>

        {/* Back to home */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          onClick={() => navigate("/")}
          className="w-full text-center text-[10px] font-display tracking-wider mt-5 flex items-center justify-center gap-1.5"
          style={{ color: "hsl(220 15% 35%)" }}
        >
          <span className="text-xs">←</span> Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
