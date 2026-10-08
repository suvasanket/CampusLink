import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { StudentProfile, Institution, SkillItem, ProjectItem, CertificationItem } from '../types';
import { GraduationCap, Sparkles, ShieldCheck, ArrowRight, Plus, Trash2, CheckCircle2, User, BookOpen, Code, Award } from 'lucide-react';

export const StudentRegistrationPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loadingInst, setLoadingInst] = useState(true);

  // Form State
  const [id, setId] = useState(`STU_${Math.floor(Math.random() * 9000 + 1000)}`);
  const [name, setName] = useState('');
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

    try {
      setSubmitting(true);
      setError(null);

      const profilePayload: StudentProfile = {
        id: id.trim(),
        name: name.trim(),
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

      const registered = await api.registerStudent(institutionId!, profilePayload);
      
      // Navigate straight to student profile portal
      const targetInstSlug = institution?.username || institutionId;
      navigate(`/${targetInstSlug}/student/${registered.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register student. ID may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const instName = institution?.name || institutionId;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Campus Placement Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Student Registration Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Register under <span className="text-indigo-300 font-medium">{instName}</span> to unlock your employability diagnostics and campus drive applications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Quick Sample:</span>
            <button
              type="button"
              onClick={() => handlePreFill('rahul')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700"
            >
              Rahul (Backend)
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('sneha')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-violet-300 border border-slate-700"
            >
              Sneha (AI/ML)
            </button>
            <button
              type="button"
              onClick={() => handlePreFill('arjun')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 border border-slate-700"
            >
              Arjun (Frontend)
            </button>
          </div>
        </div>

        {/* Security / OTP Notice */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-indigo-300">Direct Enrolment Mode:</span> Student email OTP verification is bypassed for immediate activation.
            <div className="text-slate-400 text-[11px] mt-0.5">
              Unique Student ID provides permanent access to profile: <span className="font-mono text-indigo-300">/{institutionId}/student/&lt;student_id&gt;</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* Section 1: Academic & Personal Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>1. Academic & Identification Profile</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Roll / ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU2027_042"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Branch / Discipline *
                </label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                  <option value="EEE">Electrical & Electronics (EEE)</option>
                  <option value="AIDS">AI & Data Science (AIDS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={e => setBacklogs(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={e => setGraduationYear(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Skills */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>2. Technical Skills & Proficiencies</span>
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((s, idx) => (
                <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-indigo-200 text-xs">
                  <span>{s.name}</span>
                  <span className="font-mono text-[10px] text-indigo-400">({Math.round(s.level * 100)}%)</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-400 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
              <input
                type="text"
                placeholder="Skill name (e.g. Docker, Go, PyTorch)"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400"
              />
              <div className="flex items-center space-x-2 w-full sm:w-48">
                <span className="text-[11px] text-slate-400">Level:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={newSkillLevel}
                  onChange={e => setNewSkillLevel(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-mono text-slate-300 w-8">{Math.round(newSkillLevel * 100)}%</span>
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 3: Projects & Work */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>3. Portfolio Projects</span>
            </h3>

            <div className="space-y-3 mb-4">
              {projects.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.technologies.map((t, tidx) => (
                        <span key={tidx} className="px-2 py-0.5 rounded bg-slate-700 text-[10px] text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="text-slate-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
              <input
                type="text"
                placeholder="Project Title"
                value={projTitle}
                onChange={e => setProjTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400"
              />
              <textarea
                placeholder="Brief description of impact, problem solved, architecture"
                rows={2}
                value={projDesc}
                onChange={e => setProjDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Technologies (comma separated, e.g. Python, Docker, React)"
                  value={projTech}
                  onChange={e => setProjTech(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Assessments */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>4. Baseline Readiness & Assessment Scores</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Coding / Technical</span>
                  <span className="font-mono text-indigo-400">{technical}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={technical}
                  onChange={e => setTechnical(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Aptitude & Logic</span>
                  <span className="font-mono text-indigo-400">{aptitude}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aptitude}
                  onChange={e => setAptitude(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Communication</span>
                  <span className="font-mono text-indigo-400">{communication}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communication}
                  onChange={e => setCommunication(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
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
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing Readiness & Enrolling...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration & Open Profile</span>
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
