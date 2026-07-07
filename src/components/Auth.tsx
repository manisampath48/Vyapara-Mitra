import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, Lock, Mail, UserPlus, LogIn, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (token: string, user: { id: string; username: string; name: string; email: string; role: string }) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Business Owner');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setRole('Business Owner');
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    resetFields();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        
        if (rememberMe) {
          localStorage.setItem('vm_token', data.token);
          localStorage.setItem('vm_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('vm_token', data.token);
          sessionStorage.setItem('vm_user', JSON.stringify(data.user));
        }
        onAuthSuccess(data.token, data.user);
      } else if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, name, email, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register account');
        
        localStorage.setItem('vm_token', data.token);
        localStorage.setItem('vm_user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      } else {
        // Forgot password
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No account found with this email');
        
        setSuccessMsg(data.message || 'Reset link sent successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative z-10"
      >
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md mb-4">
            <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            VyaparaMitra
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
            Your AI-Powered Business Operating System
          </p>
        </div>

        {/* Action Title */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Business'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'signin' && 'Sign in to access your business cockpit and ledger tools.'}
            {mode === 'signup' && 'Register an owner or team account to get started.'}
            {mode === 'forgot' && 'Provide your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Error or Success Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-red-500/10 border border-red-200 text-red-600 rounded-xl flex items-start gap-2.5 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-200 text-emerald-600 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amit@gmail.com"
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Role</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="Business Owner">Business Owner (Full Admin)</option>
                    <option value="Manager">Manager (Audit & Operations)</option>
                    <option value="Employee">Employee (Billing Counter)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {mode !== 'forgot' && (
            <>
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. owner)"
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-10 py-3 rounded-xl focus:border-blue-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            /* Forgot Password Email */
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
          )}

          {mode === 'signin' && (
            /* Remember Me */
            <div className="flex items-center gap-2 py-1">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-white border-slate-300 rounded accent-blue-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-[11px] text-slate-500 font-medium select-none cursor-pointer">
                Remember this device (Store local JWT)
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Footer Toggle Mode Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
          {mode === 'signin' ? (
            <p className="text-slate-500 font-medium">
              Don't have an account?{' '}
              <button
                onClick={() => handleModeChange('signup')}
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign Up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => handleModeChange('signin')}
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <button
              onClick={() => handleModeChange('signin')}
              className="text-slate-500 hover:text-slate-700 font-bold"
            >
              Back to Sign In
            </button>
          )}
        </div>

        {/* Demo Accounts Quick-Fill Badge */}
        {mode === 'signin' && (
          <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">
              Quick demo login (Password: <span className="text-slate-600 font-mono font-bold">password123</span>)
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                onClick={() => { setUsername('owner'); setPassword('password123'); }}
                className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100 transition"
              >
                Business Owner
              </button>
              <button
                onClick={() => { setUsername('manager'); setPassword('password123'); }}
                className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-100 transition"
              >
                Manager
              </button>
              <button
                onClick={() => { setUsername('employee'); setPassword('password123'); }}
                className="text-[9px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-100 transition"
              >
                Employee
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
