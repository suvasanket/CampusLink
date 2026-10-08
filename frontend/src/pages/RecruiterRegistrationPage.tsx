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
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Campus Hiring Drive Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recruiter & Employer Registration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Partner with <span className="text-violet-300 font-medium">{instName}</span> to evaluate pre-screened talent with deterministic eligibility & AI matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Pre-Fill:</span>
            <button
              type="button"
              onClick={() => handlePreFill('google')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700"
            >
              Google Cloud
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('microsoft')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 border border-slate-700"
            >
              Microsoft
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('razorpay')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 border border-slate-700"
            >
              Razorpay
            </button>
          </div>
        </div>

        {/* Security / OTP Notice */}
        <div className="mt-6 p-4 rounded-xl bg-violet-950/40 border border-violet-800/50 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-violet-300">Instant Verification:</span> Corporate corporate email OTP verification is bypassed in this preview.
            <div className="text-slate-400 text-[11px] mt-0.5">
              Access your dedicated recruiter console permanently at: <span className="font-mono text-violet-300">/{institutionId}/recruiter/&lt;recruiter_id&gt;</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hiring Manager / Recruiter Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud or Datadog"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.chen@google.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Designation / Title
              </label>
              <input
                type="text"
                placeholder="e.g. University Talent Lead"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Initial Drive Role Setup */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Initial Campus Job Posting (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer (Fresher)"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum Cutoff CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={e => setMinCgpa(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eligible Branches
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CSE', 'IT', 'ECE', 'MECH', 'EEE', 'AIDS'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBranchToggle(b)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        branches.includes(b)
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Core Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, SQL, REST APIs, Git"
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate(`/${institution?.username || institutionId}`)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to Institution Dashboard
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Recruiter Drive...</span>
                </>
              ) : (
                <>
                  <span>Unlock Recruiter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
