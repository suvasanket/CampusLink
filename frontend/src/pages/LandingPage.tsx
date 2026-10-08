import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { Building2, Sparkles, ShieldCheck, ArrowRight, Lock, KeyRound, AlertCircle, LogIn, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check if an institution is already logged in on boot
  useEffect(() => {
    const existing = authService.getLoggedInInstitution();
    if (existing) {
      // Once an institution is logged in, base domain will open their respective institution portal
      navigate(`/${existing.username || existing.id}`, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginError('Please enter your college username or code.');
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError(null);
      const cleanSlug = usernameInput.trim().toLowerCase();
      const institution = await api.getInstitution(cleanSlug);

      if (institution) {
        authService.setLoggedInInstitution(institution);
        navigate(`/${institution.username || institution.id}`);
      } else {
        setLoginError(`No institution found with username '@${cleanSlug}'. Please verify or register.`);
      }
    } catch (err: any) {
      setLoginError(err.message || `Institution '@${usernameInput.trim()}' not found. Please register your college.`);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = async (slug: string) => {
    try {
      setLoggingIn(true);
      setLoginError(null);
      const institution = await api.getInstitution(slug);
      if (institution) {
        authService.setLoggedInInstitution(institution);
        navigate(`/${institution.username || institution.id}`);
      }
    } catch (err: any) {
      setLoginError(`Demo college '${slug}' not seeded. Please register.`);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institution Portal Login
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            Enter your college username to access your secure university placement dashboard and cohort intelligence.
          </p>
        </div>

        {/* Security / Privacy Assurance */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-emerald-300">Tenant Isolation Enforced:</span> Each institution's student cohort, placement drives, and analytics are isolated and strictly inaccessible to other colleges.
          </div>
        </div>

        {loginError && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Registered College Username or ID
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">@</span>
              <input
                type="text"
                required
                placeholder="e.g. apex-inst or national-tech"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Your college dashboard will open at: <span className="font-mono text-indigo-400">/{usernameInput.trim().toLowerCase() || '&lt;username&gt;'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Institution...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In to Institution Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Track Options */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="text-xs text-slate-400 mb-2">Instant Demo Session:</div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('apex-inst')}
              disabled={loggingIn}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700 font-mono"
            >
              Demo: @apex-inst
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('national-tech')}
              disabled={loggingIn}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-violet-300 border border-slate-700 font-mono"
            >
              Demo: @national-tech
            </button>
          </div>
        </div>

        {/* Registration CTA for New Colleges */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Has your college not registered on CampusLink yet?
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline inline-flex items-center space-x-1"
          >
            <span>Register Your College or University →</span>
          </button>
        </div>

      </div>
    </div>
  );
};
