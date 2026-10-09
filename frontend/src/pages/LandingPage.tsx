import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import {
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Lock,
  AlertCircle,
  LogIn,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Layers
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // If an institution is already logged in, navigate to their dashboard
  useEffect(() => {
    const existing = authService.getLoggedInInstitution();
    if (existing) {
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
      setLoginError('Please enter your administrator password.');
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
    <div className="max-w-7xl mx-auto py-8 sm:py-14 px-4 sm:px-6 lg:px-8 space-y-16 animate-fadeIn">
      
      {/* 1. Main Hero & Login Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Human-Centric Hero & Benefits */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.25)] border-2 border-amber-400/40 shrink-0 bg-[#f9ba32]/10 flex items-center justify-center p-0.5">
                <img src={logoImg} alt="CampusLink Logo" className="w-full h-full object-cover rounded-[14px]" />
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span>Smart Campus Placement Platform</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
              Connecting Campuses, Students & Hiring Partners.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              CampusLink replaces spreadsheets and manual coordination with automated eligibility checks, fair multi-factor candidate matching, and transparent career readiness for every student.
            </p>
          </div>

          {/* Quick Value Cards for All 3 Stakeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-2 shadow-sm hover:border-emerald-500/30 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-display font-bold text-white text-sm">For Colleges</div>
              <p className="text-xs text-slate-400 leading-normal">
                Host seamless placement drives, track batch statistics, and protect student privacy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-2 shadow-sm hover:border-emerald-500/30 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-1">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="font-display font-bold text-white text-sm">For Students</div>
              <p className="text-xs text-slate-400 leading-normal">
                See exact job matches, discover missing skills, and build a verified profile recruiters trust.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/[0.08] space-y-2 shadow-sm hover:border-emerald-500/30 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="font-display font-bold text-white text-sm">For Recruiters</div>
              <p className="text-xs text-slate-400 leading-normal">
                Shortlist pre-screened graduates in seconds with objective cutoffs and skill scores.
              </p>
            </div>
          </div>

          {/* Interactive Campus Workspaces Demo Selector */}
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Explore Active Campus Workspaces</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Click to preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  <div className="text-[11px] text-slate-400 mt-1">
                    Bengaluru Campus • 32 Students Enrolled • 6 Active Drives
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1 font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Placement Console</span>
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
                  <div className="text-[11px] text-slate-400 mt-1">
                    Surathkal Campus • Engineering & Science Division
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-1 font-mono text-[11px] text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Open NIT Console</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Gateway & Admin Login */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e111a] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

            {/* Header */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Placement Portal Gateway</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                Institution Admin Login
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with your registered college identifier and administrator password.
              </p>
            </div>

            {/* Privacy Note */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-slate-300 leading-normal">
                <strong className="text-white font-medium">Protected Access:</strong> Student records and recruitment analytics are strictly restricted to verified placement officers.
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
                    Admin Password *
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
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Destination:</span>
                  <span className="text-emerald-300">/{usernameInput.trim().toLowerCase() || '<college>'}</span>
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
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>Open College Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>

            {/* Candidate & Recruiter Quick Navigation */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Are you a registered student?</span>
                <button
                  type="button"
                  onClick={() => navigate(`/${usernameInput.trim().toLowerCase() || 'apex-inst'}/student-login`)}
                  className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Login →</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Visiting talent recruiter?</span>
                <button
                  type="button"
                  onClick={() => navigate(`/${usernameInput.trim().toLowerCase() || 'apex-inst'}/recruiter`)}
                  className="font-mono text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center space-x-1"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Recruiter Portal →</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">New college placement cell?</span>
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

      {/* 2. Platform Value Propositions for General Audience */}
      <div className="pt-6 border-t border-white/[0.08] space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Built for Modern University Placements
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Everything your campus needs to run successful recruitment drives with complete clarity, transparency, and fairness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Instant Cutoff Verification
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Define minimum CGPA, accepted degree branches, and tolerated active backlogs. Qualified applicants are screened instantly with zero manual cross-checking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Fair Multi-Factor Scoring
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Candidates are evaluated transparently across 6 dimensions: technical skills, real project experience, academic standing, standardized assessments, and communication.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Dedicated College Workspaces
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every college gets a private environment with a custom web address, password-protected administrative controls, and isolated student cohort records.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
export default LandingPage;
