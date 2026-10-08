import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { InstitutionStats, StudentProfile, JobRequirements, ApplicationRecord, Institution, Recruiter } from '../types';
import { authService } from '../services/auth';
import {
  Building2,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  Search,
  Download,
  Star,
  Copy,
  Check,
  ExternalLink,
  UserPlus,
  Sparkles,
  GraduationCap,
  LogOut
} from 'lucide-react';

export const InstitutionPortal: React.FC = () => {
  const { institutionId } = useParams<{ institutionId?: string }>();
  const navigate = useNavigate();

  // If no param, default to apex-inst
  const activeIdentifier = institutionId || 'apex-inst';

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<JobRequirements[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Link copy toast
  const [copiedLink, setCopiedLink] = useState<'student' | 'recruiter' | null>(null);

  useEffect(() => {
    loadData(activeIdentifier);
  }, [activeIdentifier]);

  const loadData = async (identifier: string) => {
    try {
      setLoading(true);
      const [instRes, statsRes, studentsRes, jobsRes, recruitersRes, appsRes] = await Promise.all([
        api.getInstitution(identifier).catch(() => null),
        api.getScopedInstitutionStats(identifier).catch(() => api.getInstitutionStats()),
        api.getInstitutionStudents(identifier).catch(() => api.getStudents()),
        api.getInstitutionJobs(identifier).catch(() => api.getJobs()),
        api.getInstitutionRecruiters(identifier).catch(() => []),
        api.getApplications()
      ]);

      if (instRes) {
        setInstitution(instRes);
        authService.setLoggedInInstitution(instRes);
      }
      setStats(statsRes);
      setStudents(studentsRes);
      setJobs(jobsRes);
      setRecruiters(recruitersRes);
      setApplications(appsRes);
    } catch (err) {
      console.error('Failed to load institution portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentInstSlug = institution?.username || activeIdentifier;
  const studentRegUrl = `${originUrl}/${currentInstSlug}/student-registration`;
  const recruiterRegUrl = `${originUrl}/${currentInstSlug}/recruiter-registration`;

  const handleCopyLink = (type: 'student' | 'recruiter', url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleExportCohortCsv = () => {
    if (!students.length) return;
    const headers = ['Student ID', 'Full Name', 'Branch', 'Graduation Year', 'CGPA', 'Active Backlogs', 'Readiness Score', 'Status Tier', 'Skills'];
    const rows = filteredStudents.map(s => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.branch}"`,
      s.graduation_year || 2027,
      s.cgpa,
      s.backlogs,
      s.readiness_score || 'N/A',
      `"${s.readiness_tier || 'Evaluating'}"`,
      `"${s.skills.map(sk => sk.name).join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${institution?.name || 'CampusLink'}_Cohort_Report_${branchFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    const matchesBranch = branchFilter === 'all' || s.branch.toUpperCase() === branchFilter.toUpperCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Banner with Institution Details & Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{institution?.code ? `${institution.code} • ` : ''}Institution Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {institution?.name || 'Campus Cohort Placement Intelligence'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Permanent Dashboard: <span className="text-indigo-300 font-mono font-medium">/{currentInstSlug}</span>
              {institution?.location && ` • ${institution.location}`}
              {institution?.admin_name && ` • Placement Officer: ${institution.admin_name}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-xs text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800/60 flex items-center space-x-1.5 transition-all shadow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout from Institution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shareable Referral Links Banner (Highlighted for User Requirement) */}
      <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-800/60 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Institution Referral & Registration Links</span>
        </div>
        <p className="text-xs text-slate-300">
          Share these custom URLs with your students and visiting corporate recruiters to automatically enroll them under <strong className="text-white">{institution?.name || 'your institution'}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Student Referral Link */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <span>Student Enrolment Link</span>
              </div>
              <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 truncate select-all">
                {studentRegUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyLink('student', studentRegUrl)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                {copiedLink === 'student' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Student Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(`/${currentInstSlug}/student-registration`)}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Recruiter Referral Link */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-sky-400" />
                <span>Recruiter Registration Link</span>
              </div>
              <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 truncate select-all">
                {recruiterRegUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyLink('recruiter', recruiterRegUrl)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                {copiedLink === 'recruiter' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Recruiter Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(`/${currentInstSlug}/recruiter-registration`)}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Enrolled Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">
              {stats.total_students}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Under this campus</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Campus Drives</span>
              <Briefcase className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">
              {stats.total_jobs}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Open corporate drives</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Shortlists</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-300 mt-2 font-mono">
              {stats.total_shortlists ?? applications.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Candidate selections</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Highly Ready</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              {stats.readiness_distribution['Highly Employable'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Score ≥ 80</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Drive Ready</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-sky-400 mt-2 font-mono">
              {stats.readiness_distribution['Ready'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Score 65–79</div>
          </div>
        </div>
      )}

      {/* Cohort Readiness Distribution & Branch Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Distribution Visual */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 shadow-lg">
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Cohort Employability Tiers</span>
            </h2>

            <div className="space-y-4">
              {[
                { tier: 'Highly Employable', count: stats.readiness_distribution['Highly Employable'] || 0, color: 'bg-emerald-500', text: 'text-emerald-400' },
                { tier: 'Ready', count: stats.readiness_distribution['Ready'] || 0, color: 'bg-indigo-500', text: 'text-indigo-400' },
                { tier: 'Developing', count: stats.readiness_distribution['Developing'] || 0, color: 'bg-amber-500', text: 'text-amber-400' },
                { tier: 'Not Ready', count: stats.readiness_distribution['Not Ready'] || 0, color: 'bg-rose-500', text: 'text-rose-400' },
              ].map((item, idx) => {
                const pct = stats.total_students > 0 ? (item.count / stats.total_students) * 100 : 0;
                return (
                  <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{item.tier}</span>
                      <span className={`font-mono font-bold ${item.text}`}>
                        {item.count} students ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch Breakdown Cards */}
          <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 shadow-lg">
            <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Discipline Breakdown & Academic Benchmarks</span>
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              {Object.entries(stats.branch_summary).map(([branch, info]) => (
                <div key={branch} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-indigo-400 font-extrabold text-sm font-mono">{branch}</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{info.total}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Avg CGPA: <strong className="text-slate-200">{info.avg_cgpa}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registered Recruiters Panel */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sky-400">
            <Briefcase className="w-4 h-4" />
            <h2 className="text-base font-bold text-white">Active Visiting Recruiters ({recruiters.length})</h2>
          </div>
          <button
            onClick={() => navigate(`/${currentInstSlug}/recruiter-registration`)}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register Recruiter</span>
          </button>
        </div>

        {recruiters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recruiters.map(rec => (
              <div
                key={rec.id}
                onClick={() => navigate(`/${currentInstSlug}/recruiter/${rec.id}`)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
                    {rec.company_name}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{rec.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{rec.email}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {rec.active_jobs_count || 1} Role{(rec.active_jobs_count || 1) > 1 ? 's' : ''}
                  </span>
                  <div className="text-sky-400 text-xs mt-1 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 italic flex items-center justify-between">
            <span>No corporate recruiters registered yet for this campus.</span>
            <button
              onClick={() => navigate(`/${currentInstSlug}/recruiter-registration`)}
              className="text-indigo-400 hover:underline"
            >
              Register First Recruiter
            </button>
          </div>
        )}
      </div>

      {/* Student Directory Table with Filters & CSV Export */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Student Placement Directory</h2>
            <p className="text-xs text-slate-400">Total {filteredStudents.length} candidates enrolled at this campus</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, branch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="AIDS">AIDS</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCohortCsv}
              disabled={filteredStudents.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cohort CSV</span>
            </button>

            {/* Enroll New Student */}
            <button
              onClick={() => navigate(`/${currentInstSlug}/student-registration`)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Readiness Index</th>
                <th className="py-3 px-4">Status Tier</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-indigo-300 font-semibold">{student.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{student.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{student.branch}</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{student.cgpa}</td>
                  <td className="py-3 px-4">
                    {student.backlogs === 0 ? (
                      <span className="text-emerald-400 font-medium">Clear (0)</span>
                    ) : (
                      <span className="text-rose-400 font-bold">{student.backlogs} Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {student.readiness_score || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        student.readiness_tier === 'Highly Employable'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : student.readiness_tier === 'Ready'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : student.readiness_tier === 'Developing'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {student.readiness_tier || 'Evaluating'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/${currentInstSlug}/student/${student.id}`)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
