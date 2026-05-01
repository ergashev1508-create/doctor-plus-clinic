import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Lock, User, AlertCircle, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    api.getMe().then(user => {
      if (user?.isAdmin) window.location.href = '/admin/dashboard';
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login({ username, password });
      if (res.success) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_email', res.user?.username || username);
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-100 rounded flex items-center justify-center mb-6 shadow-2xl">
            <Briefcase className="w-8 h-8 text-zinc-900" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">DR+ CORE ACCESS</h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">Auth Protocol: Local Admin</p>
        </div>

        <div className="bg-[#121214] border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700" />

          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Admin Access</p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Use the local administrator credentials configured for this project.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-12 py-4 text-sm outline-none focus:border-zinc-100 transition-all font-mono"
                    placeholder="doctorplus_admin"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-12 py-4 text-sm outline-none focus:border-zinc-100 transition-all font-mono"
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-100 text-zinc-900 py-4 font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50"
              >
                {loading ? 'Authorizing...' : 'System Login'}
              </button>
            </form>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            </div>
            <span className="text-[9px] font-mono text-zinc-600">
              LOCAL SESSION AUTH
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
