import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institution, RecruiterCreateData } from '../types';
import { Briefcase, Sparkles, ShieldCheck, ArrowRight, Building, Mail, User, PlusCircle, CheckCircle2 } from 'lucide-react';

export const RecruiterRegistrationPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loadingInst, setLoadingInst] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('University Talent Lead');
  
  // Initial Role
  const [roleTitle, setRoleTitle] = useState('Graduate Software Engineer');
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [branches, setBranches] = useState<string[]>(['CSE', 'IT', 'ECE']);
  const [skillsText, setSkillsText] = useState('Python, SQL, Algorithms, Git');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (institutionId) {
      loadInstitution();
    }
  }, [institutionId]);

  const loadInstitution = async () => {
    try {
      setLoadingInst(true);
      const inst = await api.getInstitution(institutionId!);
      setInstitution(inst);
    } catch (err) {
      console.warn('Could not load institution details:', err);
    } finally {
      setLoadingInst(false);
    }
  };

  const handlePreFill = (preset: 'google' | 'microsoft' | 'razorpay') => {
    if (preset === 'google') {
      setName('Sarah Chen');
      setCompanyName('Google Cloud');
      setEmail('sarah.chen@google.com');
      setDesignation('Principal Technical Recruiter');
      setRoleTitle('Cloud Software Engineer (Fresher)');
      setMinCgpa(8.0);
      setBranches(['CSE', 'IT', 'ECE']);
      setSkillsText('Python, Go, Distributed Systems, Linux');
    } else if (preset === 'microsoft') {
      setName('David Miller');
      setCompanyName('Microsoft');
      setEmail('david.miller@microsoft.com');
      setDesignation('University Talent Acquisition Lead');
      setRoleTitle('Software Development Engineer I');
      setMinCgpa(7.5);
      setBranches(['CSE', 'IT']);
      setSkillsText('C++, C#, Algorithms, Data Structures');
    } else {
      setName('Ananya Sen');
      setCompanyName('Razorpay');
      setEmail('ananya.sen@razorpay.com');
      setDesignation('Senior Campus Recruiter');
      setRoleTitle('Backend Platform Engineer');
      setMinCgpa(7.2);
      setBranches(['CSE', 'IT', 'ECE']);
      setSkillsText('Python, PostgreSQL, REST APIs, Redis');
    }
  };

  const handleBranchToggle = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter(item => item !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim() || !email.trim()) {
      setError('Please fill all required recruiter and company fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const parsedSkills = skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload: RecruiterCreateData = {
        name: name.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        designation: designation.trim(),
        initial_job_title: roleTitle.trim() || undefined,
        initial_job_min_cgpa: minCgpa,
        initial_job_branches: branches,
        initial_job_skills: parsedSkills
      };

      const createdRecruiter = await api.registerRecruiter(institutionId!, payload);

      const targetInstSlug = institution?.username || institutionId;
      navigate(`/${targetInstSlug}/recruiter/${createdRecruiter.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register recruiter.');
    } finally {
      setSubmitting(false);
    }
  };

  const instName = institution?.name || institutionId;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 cols): Sticky Requisition Blueprint Preview & Presets */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          
          {/* Live Requisition Blueprint Card */}
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Requisition Blueprint</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase">Live Preview</span>
            </div>

            {/* Role Header */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/[0.04] text-emerald-300 border border-white/[0.08]">
                  {companyName.trim() || 'Company Entity'}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-white tracking-tight leading-snug">
                {roleTitle.trim() || 'Job Role Title'}
              </h3>
              <div className="font-mono text-xs text-slate-400">
                Lead: <span className="text-slate-200">{name.trim() || 'Hiring Lead'}</span>
                {designation && ` • ${designation}`}
              </div>
            </div>

            {/* Cutoffs Cockpit */}
            <div className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center py-0.5 border-b border-white/[0.04]">
                <span className="text-slate-400">Min CGPA Threshold:</span>
                <span className="font-bold text-white tabular-nums bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  {minCgpa.toFixed(1)} / 10.0
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400">Disciplines:</span>
                <span className="font-semibold text-emerald-300">{branches.join(', ') || 'None selected'}</span>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Required Core Skills:</div>
              <div className="flex flex-wrap gap-1.5">
                {skillsText.split(',').map(s => s.trim()).filter(Boolean).map((sk, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Deterministic Matching:</span> Candidate ranking uses exact arithmetic formula dot-products.
            </div>
          </div>

          {/* Quick Pre-fill Presets */}
          <div className="p-5 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-3 shadow-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Corporate Presets</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handlePreFill('google')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Google Cloud
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">Cloud Software Engineer • 8.0 CGPA</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('microsoft')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Microsoft
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">Software Development Engineer I • 7.5 CGPA</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('razorpay')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Razorpay
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">Backend Platform Engineer • 7.2 CGPA</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (8 cols): Spacious Structured Form Deck */}
        <div className="lg:col-span-8">
          <div className="bg-[#0e111a] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-8">
            
            {/* Header Banner */}
            <div className="space-y-2 pb-6 border-b border-white/[0.08]">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Partner Campus: {instName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Corporate Recruiter Onboarding & Requisition Setup
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Connect your talent pipeline with pre-screened student cohorts using deterministic hard eligibility and 6-factor multi-dimensional ranking.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 01: Recruiter & Organization Identity */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>01 // Corporate Identity & Hiring Lead Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Hiring Manager Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Chen"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Company / Organization *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google Cloud, Microsoft, Stripe"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Corporate Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. sarah.chen@google.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Designation / Role Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. University Talent Acquisition Lead"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02: Initial Requisition Criteria */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>02 // Initial Requisition Specification & Hard Cutoffs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Job Role Requisition Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Development Engineer (Fresher)"
                      value={roleTitle}
                      onChange={e => setRoleTitle(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Minimum CGPA Cutoff
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={minCgpa}
                      onChange={e => setMinCgpa(parseFloat(e.target.value))}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tabular-nums focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-2">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Eligible Academic Disciplines
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['CSE', 'IT', 'ECE', 'MECH', 'EEE', 'AIDS'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleBranchToggle(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 border ${
                            branches.includes(b)
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                              : 'bg-[#121622] text-slate-400 hover:text-white border-white/[0.06]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Required Core Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Python, SQL, REST APIs, Git, Docker"
                      value={skillsText}
                      onChange={e => setSkillsText(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="font-mono text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Return to Global Gateway
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-display font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                      <span>Creating Recruiter Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock Recruiter Matching Console</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
