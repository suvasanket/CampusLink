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
      <div className="relative overflow-hidden rounded-3xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] text-emerald-300 text-xs font-mono border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{institution?.code ? `${institution.code} // ` : ''}Campus Intelligence Monolith</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              {institution?.name || 'Campus Cohort Placement Intelligence'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Permanent Console Slug: <span className="text-emerald-300 font-mono font-medium">/{currentInstSlug}</span>
              {institution?.location && ` • ${institution.location}`}
              {institution?.admin_name && ` • Placement Officer: ${institution.admin_name}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-xs font-semibold text-slate-300 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 flex items-center space-x-2 transition-all shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Institution Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shareable Referral Links Banner */}
      <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-4">
        <div className="flex items-center space-x-2 text-emerald-300 font-display font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Institution Referral & Enrolment Gateways</span>
        </div>
        <p className="text-xs text-slate-300">
          Share these authenticated endpoints with student cohorts and visiting talent recruiters to automatically anchor them under <strong className="text-white">{institution?.name || 'this institution'}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Student Referral Link */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-300 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Student Enrolment Link</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] font-mono text-[11px] text-slate-300 truncate select-all">
                {studentRegUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyLink('student', studentRegUrl)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors active:scale-[0.98]"
              >
                {copiedLink === 'student' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard</span>
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
                className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Recruiter Referral Link */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-sky-300 uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-sky-400" />
                <span>Recruiter Onboarding Link</span>
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-[#090a0f] border border-white/[0.06] font-mono text-[11px] text-slate-300 truncate select-all">
                {recruiterRegUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCopyLink('recruiter', recruiterRegUrl)}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors active:scale-[0.98]"
              >
                {copiedLink === 'recruiter' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard</span>
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
                className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Telemetry Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-sm hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Enrolled Cohort</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono tabular-nums">
              {stats.total_students}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Under this campus</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-sm hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Active Drives</span>
              <Briefcase className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono tabular-nums">
              {stats.total_jobs}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Corporate requisitions</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-sm hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Shortlists</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-300 mt-2 font-mono tabular-nums">
              {stats.total_shortlists ?? applications.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Selections generated</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-sm hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Highly Ready</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono tabular-nums">
              {stats.readiness_distribution['Highly Employable'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Readiness score ≥ 80</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e111a] border border-white/[0.08] shadow-sm hover:border-white/[0.15] transition-colors">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider">
              <span>Drive Ready</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-teal-300 mt-2 font-mono tabular-nums">
              {stats.readiness_distribution['Ready'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Readiness score 65–79</div>
          </div>
        </div>
      )}

      {/* Cohort Readiness Distribution & Branch Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Distribution Visual */}
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-lg">
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Employability Tiers Telemetry</span>
            </h2>

            <div className="space-y-3.5">
              {[
                { tier: 'Highly Employable', count: stats.readiness_distribution['Highly Employable'] || 0, barGradient: 'from-emerald-500 to-teal-400', text: 'text-emerald-400' },
                { tier: 'Ready', count: stats.readiness_distribution['Ready'] || 0, barGradient: 'from-sky-500 to-cyan-400', text: 'text-sky-400' },
                { tier: 'Developing', count: stats.readiness_distribution['Developing'] || 0, barGradient: 'from-amber-500 to-yellow-400', text: 'text-amber-400' },
                { tier: 'Not Ready', count: stats.readiness_distribution['Not Ready'] || 0, barGradient: 'from-rose-500 to-pink-500', text: 'text-rose-400' },
              ].map((item, idx) => {
                const pct = stats.total_students > 0 ? (item.count / stats.total_students) * 100 : 0;
                return (
                  <div key={idx} className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-medium text-slate-300">{item.tier}</span>
                      <span className={`font-mono font-bold ${item.text} tabular-nums`}>
                        {item.count} students ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#090a0f] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${item.barGradient}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch Breakdown Cards */}
          <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-lg">
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Discipline Breakdown & Benchmarks</span>
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              {Object.entries(stats.branch_summary).map(([branch, info]) => (
                <div key={branch} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                  <div className="text-emerald-400 font-extrabold text-sm font-mono">{branch}</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">{info.total} Students</div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Avg CGPA: <strong className="text-slate-200 tabular-nums">{info.avg_cgpa.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registered Recruiters Panel */}
      <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-4 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sky-400 font-display font-semibold text-sm">
            <Briefcase className="w-4 h-4" />
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-200">
              Active Visiting Recruiters ({recruiters.length})
            </h2>
          </div>
          <button
            onClick={() => navigate(`/${currentInstSlug}/recruiter-registration`)}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors flex items-center space-x-1"
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
                className="p-4 rounded-2xl bg-[#121622] border border-white/[0.06] hover:border-sky-500/40 cursor-pointer transition-all hover:-translate-y-0.5 flex items-center justify-between group"
              >
                <div>
                  <div className="font-display font-semibold text-white text-xs group-hover:text-sky-300 transition-colors">
                    {rec.company_name}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{rec.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{rec.email}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
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
          <div className="p-5 rounded-2xl bg-[#121622]/60 border border-white/[0.05] text-xs text-slate-400 font-mono italic flex items-center justify-between">
            <span>No corporate recruiters registered yet for this campus.</span>
            <button
              onClick={() => navigate(`/${currentInstSlug}/recruiter-registration`)}
              className="text-emerald-400 hover:underline font-mono"
            >
              Register First Recruiter
            </button>
          </div>
        )}
      </div>

      {/* Student Directory Table with Filters & CSV Export */}
      <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] space-y-4 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-white tracking-tight">Student Placement Directory</h2>
            <p className="text-xs font-mono text-slate-400">Total {filteredStudents.length} candidates enrolled at this campus</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, branch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#121622] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 w-44 font-mono transition-colors"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="bg-[#121622] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono transition-colors"
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors disabled:opacity-40 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Enroll New Student */}
            <button
              onClick={() => navigate(`/${currentInstSlug}/student-registration`)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121622] text-slate-400 font-mono text-[10.5px] uppercase tracking-wider font-semibold border-b border-white/[0.06]">
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
            <tbody className="divide-y divide-white/[0.04]">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono text-emerald-300 font-semibold">{student.id}</td>
                  <td className="py-3 px-4 font-display font-medium text-slate-100">{student.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{student.branch}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200 tabular-nums">{student.cgpa.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {student.backlogs === 0 ? (
                      <span className="text-emerald-400 font-mono text-[11px] font-medium">Clear (0)</span>
                    ) : (
                      <span className="text-rose-400 font-mono text-[11px] font-bold">{student.backlogs} Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200 tabular-nums">
                    {student.readiness_score ? `${student.readiness_score}%` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                        student.readiness_tier === 'Highly Employable'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : student.readiness_tier === 'Ready'
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : student.readiness_tier === 'Developing'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {student.readiness_tier || 'Evaluating'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/${currentInstSlug}/student/${student.id}`)}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Dossier →
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
