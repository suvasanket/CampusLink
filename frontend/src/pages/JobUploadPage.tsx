import React, { useState } from 'react';
import { api } from '../services/api';
import { JobRequirements } from '../types';
import { PlusCircle, CheckCircle2, AlertCircle, FileText, Sparkles, Upload, FileUp } from 'lucide-react';

interface JobUploadPageProps {
  onJobCreated: (newJobId: string) => void;
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
      setSuccessMsg('Successfully parsed and populated job attributes using AI!');
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
      setErrorMsg('Please fill in title, company, and required skills.');
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
      setSuccessMsg(`Requisition created successfully as ${newJobId}! Redirecting...`);
      setTimeout(() => {
        onJobCreated(newJobId);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
            <PlusCircle className="w-4 h-4" />
            <span>New Corporate Placement Requisition</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRawJdText(SAMPLE_JDS.google);
              setShowAiModal(true);
            }}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-950/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Fast-Ingest JD</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">Create / Ingest Job Specification</h1>
        <p className="text-xs text-slate-300 mt-1">
          Define role requirements, hard eligibility cutoffs, and skills. Candidates will be ranked instantaneously.
        </p>

        {/* Quick Sample Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Load Template:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('google')}
            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
          >
            Google Cloud (Backend)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('microsoft')}
            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
          >
            Microsoft Azure (AI/ML)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('amazon')}
            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
          >
            Amazon AWS (Frontend)
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-6 shadow-xl">
        
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Role Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Backend Software Engineer"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Hiring Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Google Cloud"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Role Description / JD Context
          </label>
          <textarea
            rows={3}
            placeholder="Paste raw JD description or duties..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Cutoffs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Minimum CGPA Cutoff (0.0 – 10.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.0"
              max="10.0"
              value={minCgpa}
              onChange={e => setMinCgpa(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Max Tolerated Active Backlogs
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={maxBacklogs}
              onChange={e => setMaxBacklogs(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Branches */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Eligible Degree Disciplines
          </label>
          <div className="flex flex-wrap gap-2">
            {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(b => (
              <button
                type="button"
                key={b}
                onClick={() => handleBranchToggle(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  branches.includes(b)
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mandatory Required Skills (Comma-separated) *
            </label>
            <input
              type="text"
              placeholder="e.g. Python, SQL, REST API"
              value={requiredSkills}
              onChange={e => setRequiredSkills(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Preferred Bonus Skills (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Docker, PostgreSQL, Redis"
              value={preferredSkills}
              onChange={e => setPreferredSkills(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{submitting ? 'Publishing Requisition...' : 'Publish Requisition & Find Candidates'}</span>
        </button>
      </form>

      {/* AI Fast-Ingest Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-violet-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Extract Job Description with AI</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste raw unstructured JD text or upload a document file. The AI extraction provider will automatically detect role titles, required skills, preferred qualifications, and minimum eligibility criteria.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.google)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  Google JD
                </button>
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.microsoft)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  Microsoft JD
                </button>
                <button
                  type="button"
                  onClick={() => setRawJdText(SAMPLE_JDS.amazon)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  Amazon JD
                </button>
              </div>

              <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700">
                <FileUp className="w-3.5 h-3.5" />
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500"
            />

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtractWithAi}
                disabled={isAiExtracting || !rawJdText.trim()}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-900/40 transition-all disabled:opacity-50"
              >
                {isAiExtracting ? 'Analyzing JD...' : 'Populate Form'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
