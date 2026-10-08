import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InstitutionStats, StudentProfile, JobRequirements, ApplicationRecord } from '../types';
import {
  Building2,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Download,
  Star
} from 'lucide-react';

export const InstitutionPortal: React.FC = () => {
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<JobRequirements[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes, jobsRes, appsRes] = await Promise.all([
        api.getInstitutionStats(),
        api.getStudents(),
        api.getJobs(),
        api.getApplications()
      ]);
      setStats(statsRes);
      setStudents(studentsRes);
      setJobs(jobsRes);
      setApplications(appsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    link.setAttribute('download', `CampusLink_Cohort_Report_${branchFilter}.csv`);
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
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/50 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institution Placement Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Campus Cohort Placement Intelligence
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Monitor real-time employability benchmarks across all degree disciplines, track recruiter requisitions, identify students needing academic or skill interventions, and optimize campus placement conversions.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Registered</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">
              {stats.total_students}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across all branches</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Hiring Drives</span>
              <Briefcase className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">
              {stats.total_jobs}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Open corporate roles</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Shortlists</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-300 mt-2 font-mono">
              {stats.total_shortlists ?? applications.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Employer selections</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Highly Ready</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              {stats.readiness_distribution['Highly Employable'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Readiness score ≥ 80</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Drive Ready</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-sky-400 mt-2 font-mono">
              {stats.readiness_distribution['Ready'] || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Readiness score 65–79</div>
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

      {/* Real-time Recruiter Shortlists Panel */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <h2 className="text-base font-bold text-white">Live Employer Shortlists Across Drives</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">
            {applications.length} Candidate Shortlists
          </span>
        </div>

        {applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {applications.map(app => (
              <div key={app.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{app.student_name}</div>
                  <div className="text-[11px] text-indigo-400 mt-0.5">{app.job_title}</div>
                  <div className="text-[10px] text-slate-400">{app.company}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {app.status}
                  </span>
                  {app.match_score && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1 font-bold">{app.match_score}% Score</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 italic">
            No shortlists registered by recruiters yet. When hiring managers shortlist candidates in the Recruiter Portal, they synchronize live here.
          </div>
        )}
      </div>

      {/* Student Directory Table with Filters & CSV Export */}
      <div className="p-6 rounded-3xl bg-slate-800/40 border border-slate-700/80 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Student Placement Directory</h2>
            <p className="text-xs text-slate-400">Total {filteredStudents.length} candidates match current filters</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
