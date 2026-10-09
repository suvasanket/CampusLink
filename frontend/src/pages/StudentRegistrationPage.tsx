import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StudentProfile, Institution, SkillItem, ProjectItem, CertificationItem } from '../types';
import { authService } from '../services/auth';
import { GraduationCap, Sparkles, ShieldCheck, ArrowRight, Plus, Trash2, CheckCircle2, User, BookOpen, Code, Award, Lock, Mail, LogIn } from 'lucide-react';

export const StudentRegistrationPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loadingInst, setLoadingInst] = useState(true);

  // Form State
  const [id, setId] = useState(`STU_${Math.floor(Math.random() * 9000 + 1000)}`);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState('CSE');
  const [graduationYear, setGraduationYear] = useState(2027);
  const [cgpa, setCgpa] = useState<number>(8.5);
  const [backlogs, setBacklogs] = useState<number>(0);
  
  // Skills
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: 'Python', level: 0.9 },
    { name: 'SQL', level: 0.8 },
    { name: 'FastAPI', level: 0.85 }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(0.8);

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      title: 'Full-Stack Placement Portal',
      description: 'Distributed microservice application connecting students and recruiters.',
      technologies: ['Python', 'FastAPI', 'React', 'PostgreSQL']
    }
  ]);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([
    { title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: 2026 }
  ]);
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  // Assessments
  const [aptitude, setAptitude] = useState<number>(85);
  const [technical, setTechnical] = useState<number>(90);
  const [communication, setCommunication] = useState<number>(88);

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

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
    setNewSkillLevel(0.8);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    if (!projTitle.trim() || !projDesc.trim()) return;
    const techArray = projTech.split(',').map(t => t.trim()).filter(Boolean);
    setProjects([...projects, { title: projTitle.trim(), description: projDesc.trim(), technologies: techArray }]);
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!certTitle.trim() || !certIssuer.trim()) return;
    setCertifications([...certifications, { title: certTitle.trim(), issuer: certIssuer.trim(), year: 2026 }]);
    setCertTitle('');
    setCertIssuer('');
  };

  const handleRemoveCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handlePreFill = (profileName: 'rahul' | 'sneha' | 'arjun') => {
    const randomSuffix = Math.floor(Math.random() * 900 + 100);
    if (profileName === 'rahul') {
      setId(`STU_RAHUL_${randomSuffix}`);
      setName('Rahul Sharma');
      setBranch('CSE');
      setCgpa(8.85);
      setBacklogs(0);
      setSkills([
        { name: 'Python', level: 0.95 },
        { name: 'FastAPI', level: 0.9 },
        { name: 'PostgreSQL', level: 0.85 },
        { name: 'Docker', level: 0.8 }
      ]);
      setProjects([
        {
          title: 'Distributed Task Queue & Event Pipeline',
          description: 'Asynchronous background worker handling 5000 req/sec with Redis streams.',
          technologies: ['Python', 'FastAPI', 'Redis', 'Docker']
        }
      ]);
      setCertifications([{ title: 'AWS Solutions Architect Associate', issuer: 'Amazon', year: 2026 }]);
      setEmail(`rahul.${randomSuffix}@apex.edu`);
      setPassword('student123');
      setConfirmPassword('student123');
      setAptitude(88);
      setTechnical(92);
      setCommunication(84);
    } else if (profileName === 'sneha') {
      setId(`STU_SNEHA_${randomSuffix}`);
      setName('Sneha Patel');
      setBranch('CSE');
      setCgpa(9.15);
      setBacklogs(0);
      setSkills([
        { name: 'PyTorch', level: 0.95 },
        { name: 'Python', level: 0.95 },
        { name: 'Scikit-Learn', level: 0.9 },
        { name: 'Transformers', level: 0.85 }
      ]);
      setProjects([
        {
          title: 'Medical Diagnostic Visual QA',
          description: 'Fine-tuned Vision-Language models on chest X-rays using LoRA tuning.',
          technologies: ['PyTorch', 'Transformers', 'HuggingFace', 'Python']
        }
      ]);
      setCertifications([{ title: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', year: 2026 }]);
      setEmail(`sneha.${randomSuffix}@apex.edu`);
      setPassword('student123');
      setConfirmPassword('student123');
      setAptitude(91);
      setTechnical(95);
      setCommunication(89);
    } else {
      setId(`STU_ARJUN_${randomSuffix}`);
      setName('Arjun Verma');
      setBranch('IT');
      setCgpa(8.10);
      setBacklogs(0);
      setSkills([
        { name: 'React', level: 0.9 },
        { name: 'TypeScript', level: 0.85 },
        { name: 'Tailwind CSS', level: 0.9 },
        { name: 'Next.js', level: 0.8 }
      ]);
      setProjects([
        {
          title: 'Interactive Code Collaboration Workspace',
          description: 'Multi-user browser IDE using Monaco Editor and CRDTs for collaborative editing.',
          technologies: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS']
        }
      ]);
      setCertifications([{ title: 'Meta Frontend Developer Professional Certificate', issuer: 'Meta', year: 2025 }]);
      setEmail(`arjun.${randomSuffix}@apex.edu`);
      setPassword('student123');
      setConfirmPassword('student123');
      setAptitude(82);
      setTechnical(87);
      setCommunication(85);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !id.trim()) {
      setError('Student name and ID are required.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please choose a secure candidate password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetInstSlug = institution?.username || institutionId;
      const profilePayload = {
        id: id.trim(),
        name: name.trim(),
        email: email.trim() || `${id.trim().toLowerCase()}@apex.edu`,
        password: password,
        branch: branch.trim(),
        graduation_year: graduationYear,
        cgpa: parseFloat(cgpa.toString()),
        backlogs: parseInt(backlogs.toString(), 10),
        skills,
        projects,
        certifications,
        assessment: {
          aptitude: parseFloat(aptitude.toString()),
          technical: parseFloat(technical.toString()),
          communication: parseFloat(communication.toString())
        },
        institution_id: institution?.id || institutionId
      };

      const registered = await api.registerStudent(institutionId!, profilePayload as any);
      
      // Save authenticated student session
      authService.setLoggedInStudent({
        id: registered.id,
        name: registered.name,
        email: registered.email,
        institution_id: targetInstSlug
      });

      // Navigate straight to student personal profile
      navigate(`/${targetInstSlug}/student/${registered.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register student. ID may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const instName = institution?.name || institutionId;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 cols): Sticky Live Dossier Telemetry & Presets */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          
          {/* Live Candidate Dossier Preview Card */}
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Dossier Preview</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase">Interactive</span>
            </div>

            {/* Candidate Header Summary */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-white tracking-tight leading-snug">
                    {name.trim() || 'Candidate Name'}
                  </h3>
                  <div className="font-mono text-xs text-slate-400 mt-0.5">
                    ID: <span className="text-emerald-300">{id || 'STU_PENDING'}</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                  {branch}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-400">CGPA: </span>
                  <strong className="text-white font-bold tabular-nums">
                    {isNaN(cgpa) ? '0.00' : Number(cgpa).toFixed(2)}
                  </strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-400">Backlogs: </span>
                  <strong className={backlogs === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {backlogs}
                  </strong>
                </div>
              </div>
            </div>

            {/* Live Readiness Estimator */}
            <div className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400 text-[11px] uppercase tracking-wider">
                  Readiness Diagnostic
                </span>
                <span className="font-mono font-bold text-emerald-300 tabular-nums">
                  {Math.min(99, Math.round((cgpa * 6) + ((aptitude + technical + communication) / 10) + (skills.length * 2)))}%
                </span>
              </div>
              <div className="w-full bg-[#090a0f] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(10, Math.round((cgpa * 6) + ((aptitude + technical + communication) / 10) + (skills.length * 2))))}%`
                  }}
                />
              </div>
            </div>

            {/* Configured Artifacts Count */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-slate-400 text-[10px] uppercase">Skills Ingested</div>
                <div className="text-base font-bold text-white mt-0.5">{skills.length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-slate-400 text-[10px] uppercase">Projects Linked</div>
                <div className="text-base font-bold text-white mt-0.5">{projects.length}</div>
              </div>
            </div>
          </div>

          {/* Quick-Fill Candidate Presets */}
          <div className="p-5 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-3 shadow-sm">
            <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Sample Presets</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handlePreFill('rahul')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Rahul Sharma
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">CSE • 8.85 CGPA • Distributed Systems</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('sneha')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Sneha Patel
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">CSE • 9.15 CGPA • AI & Transformers</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handlePreFill('arjun')}
                className="w-full p-3 rounded-xl bg-[#121622] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 text-left transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-display font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Arjun Verma
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">IT • 8.10 CGPA • Frontend Systems</div>
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
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enrolling Under: {instName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Student Candidate Dossier Enrolment
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Build your verified candidate profile to discover career matches, track eligibility, and connect with visiting recruiters.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 01: Academic Standing & Roll ID */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>01 // Academic Standing & Roll Identity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Student Roll / ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU2027_042"
                      value={id}
                      onChange={e => setId(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Academic Discipline *
                    </label>
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="MECH">Mechanical Engineering (MECH)</option>
                      <option value="EEE">Electrical & Electronics (EEE)</option>
                      <option value="AIDS">AI & Data Science (AIDS)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Cumulative CGPA (0 - 10) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={e => setCgpa(parseFloat(e.target.value))}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tabular-nums focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Active Backlogs
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={backlogs}
                      onChange={e => setBacklogs(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tabular-nums focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={e => setGraduationYear(parseInt(e.target.value, 10))}
                      className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tabular-nums focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02: Candidate Security Credentials (Email & Password) */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>02 // Candidate Security Credentials (Login Password)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Student Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul.sharma@apex.edu"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                        Account Password *
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
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#121622] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 02: Technical Skills & Proficiencies */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>02 // Core Competencies & Skills Matrix</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-slate-400">({Math.round(s.level * 100)}%)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#121622] p-3.5 rounded-2xl border border-white/[0.06]">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. Docker, PyTorch, Go)"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    className="flex-1 bg-[#090a0f] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                  <div className="flex items-center space-x-2 w-full sm:w-48">
                    <span className="text-[11px] font-mono text-slate-400">Proficiency:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={newSkillLevel}
                      onChange={e => setNewSkillLevel(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-xs font-mono text-emerald-300 tabular-nums w-8">
                      {Math.round(newSkillLevel * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-mono text-emerald-300 border border-emerald-500/40 flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Section 03: Projects & Portfolio */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>03 // Engineering Portfolio & Projects</span>
                </div>

                <div className="space-y-3">
                  {projects.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-display font-bold text-white">{p.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {p.technologies.map((t, tidx) => (
                            <span
                              key={tidx}
                              className="font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-[#121622] p-4 rounded-2xl border border-white/[0.06] space-y-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projTitle}
                    onChange={e => setProjTitle(e.target.value)}
                    className="w-full bg-[#090a0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <textarea
                    placeholder="Brief description of architecture, throughput, technical impact"
                    rows={2}
                    value={projDesc}
                    onChange={e => setProjDesc(e.target.value)}
                    className="w-full bg-[#090a0f] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                  />
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tech stack (comma separated, e.g. Python, Docker, PostgreSQL)"
                      value={projTech}
                      onChange={e => setProjTech(e.target.value)}
                      className="flex-1 w-full bg-[#090a0f] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-mono text-emerald-300 border border-emerald-500/40 flex items-center justify-center space-x-1.5 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 04: Assessment Benchmarks */}
              <div className="space-y-4">
                <div className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center space-x-2 pb-2 border-b border-white/[0.06]">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>04 // Baseline Assessment Benchmarks</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#121622] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Technical Coding</span>
                      <span className="font-bold text-emerald-300 tabular-nums">{technical}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={technical}
                      onChange={e => setTechnical(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Aptitude & Logic</span>
                      <span className="font-bold text-emerald-300 tabular-nums">{aptitude}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={aptitude}
                      onChange={e => setAptitude(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Communication</span>
                      <span className="font-bold text-emerald-300 tabular-nums">{communication}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={communication}
                      onChange={e => setCommunication(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Bar */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="font-mono text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Global Home
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/${institution?.username || institutionId}/student-login`)}
                    className="font-mono text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center space-x-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Already registered? Candidate Login →</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-display font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
                      <span>Generating Candidate Dossier...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Enrolment & Open Dossier</span>
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
