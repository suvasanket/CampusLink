import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { Institution } from '../types';
import { GraduationCap, Lock, Mail, User, ArrowRight, AlertCircle, Building2, LogIn } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const StudentLoginPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId?: string }>();
  const navigate = useNavigate();

  const activeIdentifier = institutionId || 'apex-inst';
  const [institution, setInstitution] = useState<Institution | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If student is already logged in for this institution, navigate directly to their dossier
    const existingStudent = authService.getLoggedInStudent();
    if (existingStudent && existingStudent.id) {
      const targetSlug = institution?.username || activeIdentifier;
      navigate(`/${targetSlug}/student/${existingStudent.id}`, { replace: true });
      return;
    }

    loadInstitution();
  }, [activeIdentifier]);

  const loadInstitution = async () => {
    try {
      const inst = await api.getInstitution(activeIdentifier);
      setInstitution(inst);
    } catch (err) {
      console.warn('Could not load institution details:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your Student ID or Email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.loginStudent(activeIdentifier, identifier.trim(), password);

      if (res && res.student) {
        const targetSlug = institution?.username || activeIdentifier;
        authService.setLoggedInStudent({
          id: res.student.id,
          name: res.student.name,
          email: res.student.email,
          institution_id: targetSlug
        }, res.token);

        navigate(`/${targetSlug}/student/${res.student.id}`);
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid Student ID or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (demoId: string) => {
    setIdentifier(demoId);
    setPassword('student123');
  };

  const currentInstSlug = institution?.username || activeIdentifier;

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-16 px-4 animate-fadeIn">
      <div className="rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Candidate Dossier Gateway</span>
            </div>
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.25)] border-2 border-amber-400/40 shrink-0 bg-[#F59E0B]/10 flex items-center justify-center p-0.5">
              <img src={logoImg} alt="CampusLink Logo" className="w-full h-full object-cover rounded-[12px]" />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold text-white">
                {institution?.name || activeIdentifier}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Student Placement Portal • @{currentInstSlug}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            Sign in to view your career readiness diagnostic, inspect company eligibility matches, and review placement drive shortlists.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Student ID or Registered Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. STU001 or rahul.sharma@apex.edu"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Student Password *
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
                placeholder="Enter your student password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
              <span>Seeded student test password:</span>
              <span className="text-emerald-400">student123</span>
            </div>
          </div>

          {/* Quick Demo Shortcuts */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="text-[11px] font-mono text-slate-400">Quick Test Profiles (Seeded):</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STU001')}
                className="px-2.5 py-1 rounded-lg bg-[#121622] hover:bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-emerald-300 transition-colors"
              >
                STU001 (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('STU002')}
                className="px-2.5 py-1 rounded-lg bg-[#121622] hover:bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-emerald-300 transition-colors"
              >
                STU002 (Priya)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('STU003')}
                className="px-2.5 py-1 rounded-lg bg-[#121622] hover:bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-emerald-300 transition-colors"
              >
                STU003 (Rohan)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-display font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                <span>Authenticating Student...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Sign In to Student Dossier</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-4 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Not registered as a candidate yet?</span>
            <button
              type="button"
              onClick={() => navigate(`/${currentInstSlug}/student-registration`)}
              className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Enrol Student Profile →
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Institution Administrator?</span>
            <button
              type="button"
              onClick={() => navigate(`/${currentInstSlug}`)}
              className="font-mono text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Admin Console Login →
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-mono text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Return to Global Gateway
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default StudentLoginPage;
