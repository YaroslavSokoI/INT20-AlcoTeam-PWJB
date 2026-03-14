import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';

export function LoginPage() {
  const loginFn = useAuthStore(state => state.login);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    const success = await loginFn(login, password);
    
    if (!success) {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-400/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-400/10 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-black flex items-center justify-center shadow-2xl mb-4 group hover:scale-105 transition-transform">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">WellnesAdmin</h1>
          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-widest">Core Onboarding System</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[40px] p-8 md:p-10 shadow-2xl shadow-black/5 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Welcome back</h2>
            <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-tight">Login to your administrator account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-black transition-colors" />
                <input
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  className={cn(
                    "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none",
                    error && "border-red-200 bg-red-50/30"
                  )}
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-black transition-colors" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={cn(
                    "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none",
                    error && "border-red-200 bg-red-50/30"
                  )}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-100"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-black">Invalid username or password</p>
              </motion.div>
            )}

            <button
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-black shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all mt-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          <span>Secure Administrator Access Only</span>
        </div>
      </motion.div>
    </div>
  );
}
