import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import siteLogo from '../../assets/sitelogo.webp';
import { login, type AdminUser } from '../api';

interface LoginScreenProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToWebsite: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onBackToWebsite,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide your username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(username, password);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('adminpassword123');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-4 sm:p-6 relative selection:bg-emerald-500 selection:text-black">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <img src={siteLogo} alt="NXTGen Studio" className="h-7 w-auto" />
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NXTGEN Studio CMS
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in with your administrative account to manage site content.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Default initial credentials helper */}
          <div className="pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-emerald-400" />
              Use default seed admin credentials
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs text-zinc-600 z-10">
        &copy; {new Date().getFullYear()} NXTGEN Studio Company. Protected CMS.
      </div>
    </div>
  );
};
