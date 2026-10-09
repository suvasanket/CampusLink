import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  StudentProfile,
  JobRequirements,
  StudentReadinessResponse,
  SkillGapResponse,
  ApplicationRecord,
  Institution
} from '../types';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  FileText,
  Upload,
  X,
  Star,
  Check,
  Lock,
  LogOut,
  User,
  AlertCircle,
  Building2,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { authService } from '../services/auth';

const SAMPLE_RESUMES = {
  backend: `RAHUL SHARMA
Email: rahul.sharma@example.edu | Phone: +91-98765-43210
B.Tech in Computer Science and Engineering (2023 - 2027)
National Institute of Technology
CGPA: 8.85 / 10.0 | Active Backlogs: 0

TECHNICAL SKILLS
- Languages: Python, Go, SQL, C++, Bash
- Frameworks & Libraries: FastAPI, Django, SQLAlchemy, PyTest
- Databases & Systems: PostgreSQL, Redis, MongoDB, Linux System Architecture
- Tools & Cloud: Docker, Git, GitHub Actions, AWS EC2, Postman

PROJECTS
1. Distributed Task Queue & Event Pipeline
   - Developed an asynchronous background worker engine handling 5,000 requests/sec with Redis streams.
   - Stack: Python, FastAPI, Redis, Docker, PostgreSQL

2. Campus Placement Matching Service
   - Designed high-throughput microservices for matching student skills to employer requirements.
   - Stack: Python, SQLAlchemy, REST APIs, PyTest

ASSESSMENTS
- Aptitude: 88% | Technical Coding: 92% | Communication: 84%`,

  aiml: `SNEHA PATEL
Email: sneha.patel@example.edu | Portfolio: github.com/snehapatel-ai
B.Tech in Computer Science and Engineering (Data Science Specialization, 2023 - 2027)
Indian Institute of Information Technology
CGPA: 9.15 / 10.0 | Active Backlogs: 0

TECHNICAL SKILLS
- Machine Learning & Deep Learning: PyTorch, TensorFlow, Scikit-learn, Transformers, HuggingFace
- Data Science & Analytics: Python, NumPy, Pandas, Matplotlib, SQL
- NLP & Computer Vision: BERT, LLaMA Fine-tuning, LoRA, OpenCV, Vector Search (FAISS)
- Infrastructure: Linux, Docker, Git, MLflow

PROJECTS
1. Medical Diagnostic Visual Question Answering
   - Fine-tuned Vision-Language models on chest X-ray datasets using PyTorch and LoRA tuning.
   - Stack: Python, PyTorch, Transformers, HuggingFace

2. Semantic Academic Paper Search Engine
   - Built a vector similarity search engine over 50,000 arXiv research papers using SentenceTransformers.
   - Stack: Python, SentenceTransformers, PostgreSQL, FastAPI

ASSESSMENTS
- Aptitude: 91% | Technical: 95% | Communication: 89%`,

  frontend: `ARJUN VERMA
Email: arjun.verma@example.edu | Website: arjunverma.dev
B.Tech in Information Technology (2023 - 2027)
Vellore Institute of Technology
CGPA: 8.10 / 10.0 | Active Backlogs: 0

TECHNICAL SKILLS
- Frontend Core: React, TypeScript, JavaScript (ES6+), HTML5, CSS3/SCSS
- Frameworks & Libraries: Next.js, Tailwind CSS, Redux Toolkit, Zustand, Framer Motion
- Backend & Tooling: Node.js, Express, REST APIs, GraphQL, Vite, Webpack, Jest
- DevOps & Cloud: Vercel, Netlify, Docker basics, Git, GitHub Actions

PROJECTS
1. E-Commerce Merchant Dashboard
   - Built a high-performance web analytics application serving real-time order notifications with WebSockets.
   - Stack: React, Next.js, TypeScript, Tailwind CSS, Zustand

2. Interactive Code Collaboration Workspace
   - Developed a multi-user collaborative browser IDE using Monaco Editor and CRDTs for conflict-free editing.
   - Stack: TypeScript, React, Tailwind CSS, Node.js

ASSESSMENTS
- Aptitude: 82% | Technical: 87% | Communication: 85%`
};

export const StudentPortal: React.FC = () => {
  const { institutionId, studentId } = useParams<{ institutionId?: string; studentId?: string }>();
  const navigate = useNavigate();

  const activeInst = institutionId || 'apex-inst';

  // Role Authentication Context
  const [isAdmin, setIsAdmin] = useState<boolean>(() => authService.isInstitutionAdmin(activeInst));
  const [loggedInStudent, setLoggedInStudent] = useState(() => authService.getLoggedInStudent());

  // Inline Student Auth Gate State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<JobRequirements[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || '');
  const [selectedJobId, setSelectedJobId] = useState<string>('JOB001');
  
  const [readiness, setReadiness] = useState<StudentReadinessResponse | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapResponse | null>(null);
  const [studentApplications, setStudentApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [resumeText, setResumeText] = useState<string>('');
  const [parsingResume, setParsingResume] = useState<boolean>(false);
  const [parsedProfile, setParsedProfile] = useState<StudentProfile | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdmin(authService.isInstitutionAdmin(activeInst));
      setLoggedInStudent(authService.getLoggedInStudent());
    };
    window.addEventListener('campuslink-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('campuslink-auth-change', handleAuthChange);
    };
  }, [activeInst]);

  useEffect(() => {
    loadInitialData();
  }, [institutionId]);

  useEffect(() => {
    if (studentId && studentId !== selectedStudentId) {
      setSelectedStudentId(studentId);
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentReadiness(selectedStudentId);
      loadStudentApplications(selectedStudentId);
      if (selectedJobId) {
        loadSkillGaps(selectedStudentId, selectedJobId);
      }
    }
  }, [selectedStudentId, selectedJobId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [instData, studentsList, jobsList] = await Promise.all([
        api.getInstitution(activeInst).catch(() => null),
        api.getInstitutionStudents(activeInst).catch(() => api.getStudents()),
        api.getInstitutionJobs(activeInst).catch(() => api.getJobs())
      ]);

      if (instData) setInstitution(instData);
      setStudents(studentsList);
      setJobs(jobsList);

      const currentStu = authService.getLoggedInStudent();
      const adminActive = authService.isInstitutionAdmin(activeInst);

      // Prioritize studentId from route param, else logged in student, else fallback if admin
      if (studentId) {
        setSelectedStudentId(studentId);
      } else if (currentStu && currentStu.id) {
        setSelectedStudentId(currentStu.id);
      } else if (adminActive && studentsList.length > 0) {
        setSelectedStudentId(studentsList[0].id);
      } else if (studentsList.length > 0) {
        setSelectedStudentId(studentsList[0].id);
      }

      if (jobsList.length > 0) setSelectedJobId(jobsList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (newStuId: string) => {
    setSelectedStudentId(newStuId);
    const activeInstSlug = institution?.username || institutionId || 'apex-inst';
    navigate(`/${activeInstSlug}/student/${newStuId}`);
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setAuthError('Please enter your Student ID or Email and password.');
      return;
    }
    try {
      setAuthenticating(true);
      setAuthError(null);
      const res = await api.loginStudent(activeInst, loginIdentifier.trim(), loginPassword);
      if (res && res.student) {
        const targetSlug = institution?.username || activeInst;
        authService.setLoggedInStudent({
          id: res.student.id,
          name: res.student.name,
          email: res.student.email,
          institution_id: targetSlug
        }, res.token);
        setLoggedInStudent({
          id: res.student.id,
          name: res.student.name,
          email: res.student.email,
          institution_id: targetSlug
        });
        setSelectedStudentId(res.student.id);
        navigate(`/${targetSlug}/student/${res.student.id}`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Student ID or password.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleStudentLogout = () => {
    authService.logoutStudent();
    setLoggedInStudent(null);
    navigate(`/${institution?.username || activeInst}/student-login`);
  };

  const loadStudentReadiness = async (stuId: string) => {
    try {
      const res = await api.getStudentReadiness(stuId);
      setReadiness(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudentApplications = async (stuId: string) => {
    try {
      const apps = await api.getApplications({ student_id: stuId });
      setStudentApplications(apps);
    } catch (err) {
      console.warn('Could not load student applications:', err);
    }
  };

  const loadSkillGaps = async (stuId: string, jobId: string) => {
    try {
      const res = await api.getStudentSkillGaps(stuId, jobId);
      setSkillGaps(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleParseResume = async (save = false) => {
    if (!resumeText.trim()) return;
    try {
      setParsingResume(true);
      setParseError(null);
      const parsed = await api.parseResume(resumeText, save);
      setParsedProfile(parsed);

      if (save) {
        // Refresh students list and select new student
        const refreshedStudents = await api.getStudents();
        setStudents(refreshedStudents);
        setSelectedStudentId(parsed.id);
        setShowResumeModal(false);
      }
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse resume with AI.');
    } finally {
      setParsingResume(false);
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentJob = jobs.find(j => j.id === selectedJobId);

  const tierBadgeColor = (tier?: string) => {
    switch (tier) {
      case 'Highly Employable':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Ready':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Developing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const isAuthorized = isAdmin || (
    loggedInStudent !== null &&
    (loggedInStudent.id || '').toLowerCase() === (selectedStudentId || '').toLowerCase()
  );

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-16 px-4 animate-fadeIn">
        <div className="rounded-3xl bg-[#0E111A] border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 sm:p-8 space-y-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/25 text-xs font-mono uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Restricted • Candidate Credentials Required</span>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-extrabold text-white">
                  Student Candidate Dossier
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Target Profile: {selectedStudentId || 'Candidate Authentication'} • {institution?.name || activeInst}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              This candidate dossier contains private readiness metrics, CGPA assessments, and company application records. Please authenticate with your student credentials to proceed.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleStudentLogin} className="space-y-4">
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
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  Candidate Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300"
                >
                  {showLoginPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter student password (demo: student123)"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                <span>Default seeded test password:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('STU001');
                    setLoginPassword('student123');
                  }}
                  className="text-emerald-400 hover:underline"
                >
                  Quick Fill (STU001 / student123)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authenticating}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-display font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {authenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Unlock Candidate Dossier</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Not enrolled yet?</span>
              <button
                type="button"
                onClick={() => navigate(`/${institution?.username || activeInst}/student-registration`)}
                className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Register Candidate Profile →
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Institution Administrator?</span>
              <button
                type="button"
                onClick={() => navigate(`/${institution?.username || activeInst}`)}
                className="font-mono text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Admin Control Console →
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-mono text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Global Platform
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Student Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Career Readiness Diagnostic</span>
              </span>

              {isAdmin ? (
                <button
                  onClick={() => navigate(`/${institution?.username || activeInst}`)}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono text-[11px] hover:bg-sky-500/20 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>← Return to Admin Console</span>
                </button>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Candidate Session Verified</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Candidate Diagnostic & Skill Roadmap
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Enrolled under <strong className="text-emerald-300">{institution?.name || 'Institution Campus'}</strong>.
              Profile: <span className="font-mono text-emerald-400 text-xs">/{institution?.username || activeInst}/student/{selectedStudentId}</span>
            </p>
          </div>

          {/* Action & Student Identity / Selector */}
          <div className="bg-[#121622] p-4 rounded-2xl border border-white/[0.06] shrink-0 space-y-3">
            {isAdmin ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Admin Inspector:
                  </label>
                  <span className="text-[10px] font-mono text-sky-400">Officer View</span>
                </div>
                <select
                  value={selectedStudentId}
                  onChange={e => handleStudentChange(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.branch} • CGPA {s.cgpa})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Enrolled Candidate:
                </div>
                <div className="p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display font-bold text-white text-xs">{currentStudent?.name || loggedInStudent?.name}</div>
                    <div className="font-mono text-[10.5px] text-emerald-400">ID: {currentStudent?.id || loggedInStudent?.id}</div>
                  </div>
                  <button
                    onClick={handleStudentLogout}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-[11px] font-mono flex items-center space-x-1 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setResumeText(SAMPLE_RESUMES.backend);
                setParsedProfile(null);
                setParseError(null);
                setShowResumeModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Resume Parser & Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recruiter Shortlist & Applications Banner */}
      <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              My Placement Drive Applications & Shortlist Status
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {studentApplications.length} Recorded Activities
          </span>
        </div>

        {studentApplications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentApplications.map(app => (
              <div key={app.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{app.job_title}</div>
                  <div className="text-[11px] text-slate-400">{app.company}</div>
                  {app.match_score && (
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Match Score: {app.match_score}%</div>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 italic">
            This candidate has not yet been shortlisted for any active company drives. Recruiters shortlist candidates directly via the Recruiter Portal.
          </div>
        )}
      </div>

      {/* Main Grid: Readiness Card + Profile Highlights */}
      {readiness && currentStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Readiness Score Card */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 rounded-3xl border border-slate-700/80 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierBadgeColor(readiness.tier)}`}>
                  {readiness.tier}
                </span>
              </div>

              {/* Big Score Radial / Text */}
              <div className="my-6 text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent font-mono">
                  {readiness.readiness_score}
                </div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                  Employability Index (0–100)
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Technical Depth', val: readiness.factor_scores.technical_skills, color: 'bg-emerald-500' },
                  { label: 'Project Portfolio', val: readiness.factor_scores.project_depth, color: 'bg-teal-500' },
                  { label: 'Academic Standing', val: readiness.factor_scores.academics, color: 'bg-emerald-400' },
                  { label: 'Test Assessments', val: readiness.factor_scores.assessments, color: 'bg-sky-500' },
                  { label: 'Communication', val: readiness.factor_scores.communication, color: 'bg-pink-500' },
                ].map((f, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1 font-medium">
                      <span>{f.label}</span>
                      <span className="font-mono text-slate-400">{f.val.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${f.color}`} style={{ width: `${f.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 italic">
              Computed independently from individual recruiters using university placement benchmarks.
            </div>
          </div>

          {/* Student Profile & Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Demonstrated Skills & Projects</span>
              </h2>

              {/* Skills Chips */}
              <div className="mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Verified Technical Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentStudent.skills?.map((sk, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center space-x-2 text-xs"
                    >
                      <span className="font-semibold text-slate-200">{sk.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{(sk.level * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Projects */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Portfolio Projects
                </div>
                <div className="space-y-3">
                  {currentStudent.projects?.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="font-bold text-slate-100 text-sm mb-1">{proj.title}</div>
                      <p className="text-slate-300 mb-2 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies?.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Targeted Recommendations */}
            <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Employability Action Items</span>
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                {readiness.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Target Job Skill-Gap Comparison */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Target Role Skill-Gap Diagnostic</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Test your profile compatibility and missing skills against live company job postings.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400">Target Role:</span>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Gap Results */}
        {skillGaps && (
          <div className="space-y-6 pt-2">
            
            {/* Coverage Meter */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-slate-300">Skill Alignment Coverage</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{skillGaps.coverage_percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${skillGaps.coverage_percentage}%` }}
                />
              </div>
            </div>

            {/* Gap Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Missing Mandatory Skills */}
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Mandatory Skills (Critical Gaps)</span>
                </div>
                {skillGaps.missing_required_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillGaps.missing_required_skills.map((sk, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All mandatory required skills fulfilled!</span>
                  </div>
                )}
              </div>

              {/* Missing Preferred Skills */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Missing Preferred Skills (Bonus Gaps)</span>
                </div>
                {skillGaps.missing_preferred_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillGaps.missing_preferred_skills.map((sk, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
                        {sk}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No preferred skill gaps.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Actionable Next Steps */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Actionable Preparation Plan for {currentJob?.title}:
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {skillGaps.actionable_next_steps.map((step, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* AI Resume Ingestion & Parsing Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-lg font-bold text-white">AI Resume Extraction & Skill Analyzer</h2>
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Extract structured profile attributes, verified skill proficiency levels, and projects from raw resume text using the active AI ingestion engine with SHA-256 caching.
            </p>

            {/* Template Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Load Template:</span>
              <button
                type="button"
                onClick={() => setResumeText(SAMPLE_RESUMES.backend)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Rahul Sharma (Backend)
              </button>
              <button
                type="button"
                onClick={() => setResumeText(SAMPLE_RESUMES.aiml)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Sneha Patel (AI/ML)
              </button>
              <button
                type="button"
                onClick={() => setResumeText(SAMPLE_RESUMES.frontend)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                Arjun Verma (Web)
              </button>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Paste Resume Text:
              </label>
              <textarea
                rows={8}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste candidate resume text..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {parseError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed Preview */}
            {parsedProfile && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <span>Extracted Structured Schema:</span>
                  <span>{parsedProfile.name} • {parsedProfile.branch} (CGPA {parsedProfile.cgpa})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedProfile.skills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 text-[11px] font-mono">
                      {sk.name} ({(sk.level * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-300">
                  Projects: {parsedProfile.projects.map(p => p.title).join(', ')}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleParseResume(false)}
                disabled={parsingResume || !resumeText.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all disabled:opacity-50"
              >
                {parsingResume ? 'Extracting with AI...' : 'Preview Extraction'}
              </button>

              <button
                type="button"
                onClick={() => handleParseResume(true)}
                disabled={parsingResume || !resumeText.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile & Ingest</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
