import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { Building2, Sparkles, ShieldCheck, ArrowRight, Lock, KeyRound, AlertCircle, LogIn, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!passwordInput) {
      setLoginError('Please enter your Institution Admin Password.');
      return;
    }

    try {
      setLoggingIn(true);
      setLoginError(null);
      const cleanSlug = usernameInput.trim().toLowerCase();
      const authRes = await api.loginInstitution(cleanSlug, passwordInput);

      if (authRes && authRes.institution) {
        authService.setLoggedInInstitution(authRes.institution, authRes.token);
        navigate(`/${authRes.institution.username || authRes.institution.id}`);
      } else {
        setLoginError('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator password or username.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = async (slug: string) => {
    setUsernameInput(slug);
    setPasswordInput('admin123');
    try {
      setLoggingIn(true);
      setLoginError(null);
      const authRes = await api.loginInstitution(slug, 'admin123');
      if (authRes && authRes.institution) {
        authService.setLoggedInInstitution(authRes.institution, authRes.token);
        navigate(`/${authRes.institution.username || authRes.institution.id}`);
      }
    } catch (err: any) {
      setLoginError(err.message || `Demo college '${slug}' failed authentication.`);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Platform Briefing & Live Demo Nodes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <span>Multi-Tenant Placement Intelligence Monolith</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
              Deterministic Campus Cohort Intelligence
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Equip university placement cells and visiting corporate recruiters with mathematical eligibility validation, 6-factor candidate scoring, and token-free semantic matching.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">01 // EFFICIENCY</div>
              <div className="font-display font-bold text-white text-sm">0 API Tokens</div>
              <p className="text-[11px] text-slate-400 leading-normal">Candidate matching runs on local SentenceTransformers.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">02 // DETERMINISM</div>
              <div className="font-display font-bold text-white text-sm">6-Factor Score</div>
              <p className="text-[11px] text-slate-400 leading-normal">CGPA, skills, projects, and assessments scored deterministically.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">03 // ISOLATION</div>
              <div className="font-display font-bold text-white text-sm">Tenant Scoped</div>
              <p className="text-[11px] text-slate-400 leading-normal">Strict campus cohort data separation across each registered college.</p>
            </div>
          </div>

          {/* Seeded Campus Nodes Fast-Track */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Active Campus Environments</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Click to load session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('apex-inst')}
                disabled={loggingIn}
                className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all duration-200 group active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-emerald-300">@apex-inst</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="font-display font-bold text-white text-sm group-hover:text-emerald-200 transition-colors">
                    Apex Institute of Technology
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Bangalore Campus • 30+ Enrolled Students • 6 Active Drives</div>
                </div>
                <div className="mt-3 flex items-center space-x-1 font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Apex Console</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('national-tech')}
                disabled={loggingIn}
                className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all duration-200 group active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-emerald-300">@national-tech</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="font-display font-bold text-white text-sm group-hover:text-emerald-200 transition-colors">
                    National Institute of Technology
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Surathkal Campus • Engineering & Science Division</div>
                </div>
                <div className="mt-3 flex items-center space-x-1 font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter NIT Console</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Spacious Authentication Deck */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e111a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-6 relative overflow-hidden">
            
            {/* Top ambient hairline */}
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

            {/* Header */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Enterprise Authentication Gateway</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                Institution Portal Access
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authenticate with your university identifier to access your dedicated placement cockpit.
              </p>
            </div>

            {/* Security Note */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-slate-300 leading-normal">
                <strong className="text-white font-medium">Isolated Workspace:</strong> Verified institutions receive a distinct tenant scope preserving candidate privacy.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  College Username or Slug *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-inst or national-tech"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                    Admin Access Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Admin password (demo: admin123)"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="font-mono text-[10.5px] text-slate-400">
                  Target Console: <span className="text-emerald-300">/{usernameInput.trim().toLowerCase() || '<username>'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-display font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                    <span>Verifying Admin Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>Authenticate & Open Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>

            {/* Candidate & Registration CTAs */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Are you an enrolled student?</span>
                <button
                  type="button"
                  onClick={() => navigate(`/${usernameInput.trim().toLowerCase() || 'apex-inst'}/student-login`)}
                  className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Candidate Login →
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">New university placement cell?</span>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-mono text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Register College Workspace →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
