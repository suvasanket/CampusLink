import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobRequirements } from '../types';
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileUp,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface JobUploadPageProps {
  onJobCreated?: (newJobId: string) => void;
}

const SAMPLE_JDS = {
  google: `Title: Backend Software Engineer — Google Cloud
Company: Google
Location: Bangalore / Hyderabad
Experience Level: Fresher (Campus Placement 2027)

About the Role:
As a Software Engineer on the Google Cloud Infrastructure team, you will design, build, and optimize large-scale distributed backend systems that power mission-critical services for millions of enterprises worldwide.

Minimum Qualifications:
- Pursuing B.Tech / B.E. in Computer Science (CSE) or Information Technology (IT), graduating in 2027.
- Minimum CGPA: 7.5 / 10.0 with 0 active backlogs.
- Strong fundamentals in Data Structures, Algorithms, Object-Oriented Design, and System Architecture.
- Proficiency in Python, SQL, REST APIs, and Linux fundamentals.

Preferred Qualifications:
- Hands-on experience with Docker, Kubernetes, Redis, or cloud platforms (GCP / AWS).`,

  microsoft: `Title: Associate AI/ML Research Engineer — Azure AI
Company: Microsoft
Location: Hyderabad / Bengaluru
Experience Level: Fresher (Campus Placement 2027)

About the Role:
The Azure AI team at Microsoft is hiring high-potential campus graduates to work on frontier artificial intelligence systems, foundation model fine-tuning, and scalable machine learning evaluation pipelines.

Minimum Qualifications:
- B.Tech / B.E. in Computer Science (CSE) or Information Technology (IT), graduating class of 2027.
- Minimum CGPA: 8.0 / 10.0 with 0 active backlogs.
- Proficiency in Python, PyTorch, Machine Learning, and standard scientific libraries.

Preferred Qualifications:
- Experience training Large Language Models (LLMs) or Transformers.
- Familiarity with Vector Databases (pgvector, FAISS) and retrieval-augmented generation.`,

  amazon: `Title: Front-End Software Development Engineer — AWS Console
Company: Amazon
Location: Bangalore / Chennai
Experience Level: Fresher (Campus Placement 2027)

About the Role:
Amazon Web Services is seeking customer-obsessed Front-End Engineers to craft ultra-responsive, accessible, and intuitive user experiences for AWS Cloud Management Console products.

Minimum Qualifications:
- B.Tech / B.E. in CSE, IT, or ECE graduating in 2027.
- Minimum CGPA: 7.0 / 10.0 with 0 active backlogs.
- Strong proficiency in JavaScript, TypeScript, React, HTML5, and CSS3.

Preferred Qualifications:
- Experience with Next.js, Tailwind CSS, Redux Toolkit, or GraphQL.`
};

export const JobUploadPage: React.FC<JobUploadPageProps> = ({ onJobCreated }) => {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [branches, setBranches] = useState<string[]>(['CSE', 'IT']);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');

  // AI Extraction state
  const [rawJdText, setRawJdText] = useState('');
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBranchToggle = (b: string) => {
    if (branches.includes(b)) {
      setBranches(branches.filter(item => item !== b));
    } else {
      setBranches([...branches, b]);
    }
  };

  const handleLoadSample = (key: 'google' | 'microsoft' | 'amazon') => {
    if (key === 'google') {
      setCompany('Google');
      setTitle('Backend Software Engineer — Google Cloud');
      setDescription('Design, build, and optimize large-scale distributed backend systems powering mission-critical cloud services.');
      setMinCgpa('7.5');
      setMaxBacklogs('0');
      setBranches(['CSE', 'IT']);
      setRequiredSkills('Python, SQL, REST API');
      setPreferredSkills('Docker, Kubernetes, Redis, GCP');
    } else if (key === 'microsoft') {
      setCompany('Microsoft');
      setTitle('Associate AI/ML Research Engineer — Azure AI');
      setDescription('Work on frontier artificial intelligence systems, foundation model fine-tuning, and scalable machine learning evaluation pipelines.');
      setMinCgpa('8.0');
      setMaxBacklogs('0');
      setBranches(['CSE', 'IT']);
      setRequiredSkills('Python, PyTorch, Machine Learning');
      setPreferredSkills('Transformers, Vector Databases, Deep Learning');
    } else {
      setCompany('Amazon');
      setTitle('Front-End Software Development Engineer — AWS Console');
      setDescription('Craft ultra-responsive, accessible user experiences for AWS Cloud Management Console products used worldwide.');
      setMinCgpa('7.0');
      setMaxBacklogs('0');
      setBranches(['CSE', 'IT', 'ECE']);
      setRequiredSkills('React, TypeScript, REST API');
      setPreferredSkills('Next.js, Tailwind CSS, GraphQL');
    }
  };

  const handleExtractWithAi = async () => {
    if (!rawJdText.trim()) return;
    try {
      setIsAiExtracting(true);
      setErrorMsg(null);
      const res = await fetch('http://localhost:8000/jobs/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawJdText,
          company_name: company || 'Employer'
        })
      });
      if (!res.ok) {
        throw new Error('AI extraction failed');
      }
      const data: JobRequirements = await res.json();

      setTitle(data.title || title);
      setCompany(data.company || company);
      setDescription(data.description || description);
      setMinCgpa(data.minimum_cgpa.toString());
      setMaxBacklogs(data.max_backlogs.toString());
      if (data.eligible_branches && data.eligible_branches.length > 0) {
        setBranches(data.eligible_branches);
      }
      if (data.required_skills) {
        setRequiredSkills(data.required_skills.join(', '));
      }
      if (data.preferred_skills) {
        setPreferredSkills(data.preferred_skills.join(', '));
      }
      setShowAiModal(false);
      setSuccessMsg('Successfully parsed and populated job attributes using AI.');
    } catch (err: any) {
      setErrorMsg(err.message || 'AI extraction failed.');
    } finally {
      setIsAiExtracting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawJdText(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !requiredSkills) {
      setErrorMsg('Please fill in role title, hiring company, and mandatory skills.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const newJobId = `JOB_${Date.now().toString().slice(-4)}`;
      const payload: JobRequirements = {
        id: newJobId,
        company,
        title,
        description,
        minimum_cgpa: parseFloat(minCgpa) || 7.0,
        eligible_branches: branches,
        max_backlogs: parseInt(maxBacklogs, 10) || 0,
        graduation_years: [2027],
        required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        experience_level: 'Fresher'
      };

      await api.createJob(payload);
      setSuccessMsg(`Requisition published successfully as ${newJobId}. Redirecting...`);
      setTimeout(() => {
        if (onJobCreated) {
          onJobCreated(newJobId);
        } else {
          navigate('/apex-inst/recruiter');
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create job requisition.');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedRequiredSkills = requiredSkills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const parsedPreferredSkills = preferredSkills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Recruiter Dashboard</span>
          </button>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Campus Placement Requisition Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Create & Ingest Job Specification
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Define role cutoffs, degree disciplines, and skill taxonomy. Candidates will be ranked instantaneously with zero token consumption.
          </p>
        </div>

        {/* Action Buttons: AI Fast-Ingest & Templates */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setRawJdText(SAMPLE_JDS.google);
              setShowAiModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-2 transition-all active:scale-[0.98] shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Fast-Ingest JD</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Spacious 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sticky Inspector: Live Requisition Blueprint (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* Live Requisition Card Preview */}
          <div className="p-6 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Live Requisition Card</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ACTIVE SPEC
              </span>
            </div>

            <div>
              <div className="text-[11px] font-mono text-emerald-400 font-medium">
                {company || 'Hiring Enterprise Partner'}
              </div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                {title || 'Software Development Engineer'}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-xs text-slate-300">
                  Fresher (Batch 2027)
                </span>
              </div>
            </div>

            {/* Hard Cutoffs Summary */}
            <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.06] space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Deterministic Cutoffs
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block text-[10px]">MIN CGPA</span>
                  <span className="text-emerald-300 font-bold">≥ {minCgpa || '7.5'}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block text-[10px]">MAX BACKLOGS</span>
                  <span className="text-emerald-300 font-bold">{maxBacklogs || '0'} Allowed</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block text-[10px] font-mono mb-1">ELIGIBLE BRANCHES</span>
                <div className="flex flex-wrap gap-1">
                  {branches.length > 0 ? (
                    branches.map(b => (
                      <span key={b} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-rose-400 text-[11px] font-mono">No branch selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Required Skills Badges */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Mandatory Skills</span>
                <span className="text-emerald-400 font-mono text-[10px]">{parsedRequiredSkills.length} defined</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedRequiredSkills.length > 0 ? (
                  parsedRequiredSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs italic">Specify required skills below...</span>
                )}
              </div>
            </div>

            {/* Live Preferred Skills Badges */}
            {parsedPreferredSkills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Bonus Qualifications</span>
                  <span className="text-slate-400 font-mono text-[10px]">{parsedPreferredSkills.length} defined</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedPreferredSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.08] text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Hydration Cards */}
          <div className="p-5 rounded-3xl bg-[#0E111A] border border-white/[0.08] space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Hydrate Enterprise Template
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('google')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center justify-between"
              >
                <span>Google Cloud (Backend Engineer)</span>
                <span className="text-[10px] text-emerald-400 font-bold">≥ 7.5</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('microsoft')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center justify-between"
              >
                <span>Microsoft Azure (AI/ML Engineer)</span>
                <span className="text-[10px] text-emerald-400 font-bold">≥ 8.0</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('amazon')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all text-xs font-mono text-slate-300 hover:text-emerald-300 flex items-center justify-between"
              >
                <span>Amazon AWS (Frontend SDE)</span>
                <span className="text-[10px] text-emerald-400 font-bold">≥ 7.0</span>
              </button>
            </div>
          </div>

          {/* Zero-Token Local Intelligence Telemetry */}
          <div className="p-5 rounded-3xl bg-[#0E111A] border border-white/[0.08] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Matching Engine Specifications</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-mono">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>6-Factor Multi-Dimensional Dot Product</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Deterministic CGPA & Branch Hard Gate</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>Local MiniLM Vector Semantics (0 API Tokens)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Structured Form Deck (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 01: Role & Corporate Details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  01
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Corporate Identity & Role Specifications</h2>
                  <p className="text-xs text-slate-400">Basic metadata and requisition scope.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    ROLE TITLE <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Backend Software Engineer"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    HIRING COMPANY NAME <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google Cloud"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    required
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    ROLE CONTEXT & JOB DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste JD duties, team context, or project responsibilities..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Section 02: Deterministic Cutoffs */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Deterministic Hard Eligibility Rules</h2>
                  <p className="text-xs text-slate-400">Strict gatekeeper filters evaluated before candidate ranking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    MINIMUM CGPA CUTOFF (0.0 – 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.0"
                    max="10.0"
                    value={minCgpa}
                    onChange={e => setMinCgpa(e.target.value)}
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    MAX TOLERATED ACTIVE BACKLOGS
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={maxBacklogs}
                    onChange={e => setMaxBacklogs(e.target.value)}
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                </div>

                {/* Degree Disciplines */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    ELIGIBLE DEGREE DISCIPLINES
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => handleBranchToggle(b)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                          branches.includes(b)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-[#090A0F] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.15]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 03: Skills Taxonomy */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                  03
                </span>
                <div>
                  <h2 className="text-base font-display font-bold text-white">Competency & Skill Matrices</h2>
                  <p className="text-xs text-slate-400">Keywords mapped to local vector embedding similarity.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    MANDATORY REQUIRED SKILLS (COMMA-SEPARATED) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, SQL, REST API, Linux"
                    value={requiredSkills}
                    onChange={e => setRequiredSkills(e.target.value)}
                    required
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                  <div className="text-[11px] font-mono text-slate-500 mt-1.5">
                    Required skills are weighted directly in the 6-factor deterministic scoring engine.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-2">
                    PREFERRED BONUS SKILLS (COMMA-SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, Kubernetes, Redis, Cloud Architecture"
                    value={preferredSkills}
                    onChange={e => setPreferredSkills(e.target.value)}
                    className="w-full bg-[#090A0F] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
                  />
                  <div className="text-[11px] font-mono text-slate-500 mt-1.5">
                    Preferred qualifications provide competitive delta bonuses in candidate ranking.
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Bar */}
            <div className="p-6 rounded-3xl bg-[#0E111A] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors order-2 sm:order-1"
              >
                ← Discard & Return
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Publishing Requisition...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Requisition & Find Candidates</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* AI Fast-Ingest Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0E111A] border border-white/[0.1] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">Extract Job Description with AI</h3>
                  <p className="text-xs text-slate-400">Unstructured JD parsing with local fallback.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste raw unstructured JD text or upload a document file. The AI extraction provider will automatically detect role titles, required skills, preferred qualifications, and minimum eligibility criteria.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.google)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-[11px] font-mono text-slate-300 hover:text-emerald-300 border border-white/[0.06]"
                >
                  Google JD
                </button>
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.microsoft)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-[11px] font-mono text-slate-300 hover:text-emerald-300 border border-white/[0.06]"
                >
                  Microsoft JD
                </button>
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.amazon)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-[11px] font-mono text-slate-300 hover:text-emerald-300 border border-white/[0.06]"
                >
                  Amazon JD
                </button>
              </div>

              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs border border-white/[0.08] transition-colors">
                <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={8}
              value={rawJdText}
              onChange={e => setRawJdText(e.target.value)}
              placeholder="Paste raw JD text here..."
              className="w-full bg-[#090A0F] border border-white/[0.08] rounded-2xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 resize-none leading-relaxed"
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtractWithAi}
                disabled={isAiExtracting || !rawJdText.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {isAiExtracting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Analyzing JD Text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Populate Requisition Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
