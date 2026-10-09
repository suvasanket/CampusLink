import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobRequirements, JobMatchResult, CandidateMatchItem, ApplicationRecord, Recruiter, Institution } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateModal } from '../components/CandidateModal';
import { AutoShortlistModal } from '../components/AutoShortlistModal';
import {
  Briefcase,
  Filter,
  Search,
  Users,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Star,
  Download,
  Sliders,
  PlusCircle,
  ArrowLeft,
  Zap,
  Check,
  Trash2
} from 'lucide-react';
import { authService } from '../services/auth';

export const RecruiterPortal: React.FC = () => {
  const { institutionId, recruiterId } = useParams<{ institutionId?: string; recruiterId?: string }>();
  const navigate = useNavigate();

  const activeInst = institutionId || 'apex-inst';

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [jobs, setJobs] = useState<JobRequirements[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [shortlistMap, setShortlistMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selection & Auto-Shortlist Modal state
  const [isAutoShortlistOpen, setIsAutoShortlistOpen] = useState<boolean>(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };


  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minScoreCutoff, setMinScoreCutoff] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchItem | null>(null);

  useEffect(() => {
    loadRecruiterAndJobs();
  }, [activeInst, recruiterId]);

  const loadRecruiterAndJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Institution info
      const instData = await api.getInstitution(activeInst).catch(() => null);
      if (instData) setInstitution(instData);

      let jobsList: JobRequirements[] = [];

      if (recruiterId) {
        try {
          const detail = await api.getRecruiterDetails(activeInst, recruiterId);
          setRecruiter(detail.recruiter);
          if (detail.jobs && detail.jobs.length > 0) {
            jobsList = detail.jobs;
          } else {
            // If no specific jobs for recruiter, fetch institution jobs
            jobsList = await api.getInstitutionJobs(activeInst);
          }
        } catch (e) {
          console.warn('Could not load specific recruiter details:', e);
          jobsList = await api.getInstitutionJobs(activeInst);
        }
      } else {
        jobsList = await api.getInstitutionJobs(activeInst);
      }

      if (!jobsList || jobsList.length === 0) {
        jobsList = await api.getJobs();
      }

      setJobs(jobsList);
      if (jobsList.length > 0) {
        setSelectedJobId(jobsList[0].id);
        fetchMatches(jobsList[0].id);
        loadApplications(jobsList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs from API.');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      const apps = await api.getApplications({ job_id: jobId });
      const map: Record<string, number> = {};
      apps.forEach(a => {
        if (a.status === 'Shortlisted' || a.status === 'Interview' || a.status === 'Offered') {
          map[a.student_id] = a.id;
        }
      });
      setShortlistMap(map);
    } catch (err) {
      console.warn('Could not load applications for job:', err);
    }
  };

  const fetchMatches = async (jobId: string) => {
    try {
      setEvaluating(true);
      setError(null);
      const res = await api.getJobMatches(jobId, true, 50, activeInst);
      setMatchResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compute candidate matches.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    fetchMatches(id);
    loadApplications(id);
  };

  const handleToggleShortlist = async (candidate: CandidateMatchItem) => {
    if (!selectedJobId) return;
    const existingAppId = shortlistMap[candidate.student_id];

    if (existingAppId) {
      // Remove shortlist
      try {
        await api.deleteApplication(existingAppId);
        setShortlistMap(prev => {
          const next = { ...prev };
          delete next[candidate.student_id];
          return next;
        });
        showToast(`Removed ${candidate.student_name} from shortlist.`);
      } catch (err) {
        console.error('Failed to remove shortlist:', err);
      }
    } else {
      // Create shortlist
      try {
        const created = await api.createApplication({
          job_id: selectedJobId,
          student_id: candidate.student_id,
          status: 'Shortlisted',
          match_score: candidate.match_score,
          notes: `Shortlisted from ranking view (Rank #${candidate.rank})`
        });
        setShortlistMap(prev => ({
          ...prev,
          [candidate.student_id]: created.id
        }));
        showToast(`Shortlisted ${candidate.student_name}.`);
      } catch (err) {
        console.error('Failed to shortlist candidate:', err);
      }
    }
  };

  const handleToggleSelectCandidate = (candidate: CandidateMatchItem) => {
    setSelectedCandidateIds(prev => {
      const next = new Set(prev);
      if (next.has(candidate.student_id)) {
        next.delete(candidate.student_id);
      } else {
        next.add(candidate.student_id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const eligibleFiltered = filteredCandidates.filter(c => c.eligible);
    const allSelected =
      eligibleFiltered.length > 0 &&
      eligibleFiltered.every(c => selectedCandidateIds.has(c.student_id));
    if (allSelected) {
      setSelectedCandidateIds(new Set());
    } else {
      setSelectedCandidateIds(new Set(eligibleFiltered.map(c => c.student_id)));
    }
  };

  const handleBulkShortlistSelected = async () => {
    if (!selectedJobId || selectedCandidateIds.size === 0) return;
    try {
      const ids = Array.from(selectedCandidateIds);
      const res = await api.bulkShortlist(selectedJobId, ids);
      showToast(res.message);
      await loadApplications(selectedJobId);
      setSelectedCandidateIds(new Set());
    } catch (err: any) {
      console.error('Failed to bulk shortlist:', err);
      showToast(err.message || 'Failed to bulk shortlist candidates.');
    }
  };

  const handleClearShortlists = async () => {
    if (!selectedJobId) return;
    if (!window.confirm('Are you sure you want to clear all candidate shortlists for this requisition?')) return;
    try {
      const res = await api.clearJobShortlists(selectedJobId);
      showToast(`Cleared ${res.deleted_count} candidate shortlists.`);
      await loadApplications(selectedJobId);
      setSelectedCandidateIds(new Set());
    } catch (err: any) {
      console.error('Failed to clear shortlists:', err);
      showToast('Failed to clear shortlists.');
    }
  };

  const handleAutoShortlistSuccess = (msg: string) => {
    showToast(msg);
    if (selectedJobId) {
      loadApplications(selectedJobId);
    }
  };


  const handleExportCsv = () => {
    if (!matchResult || !matchResult.matches.length) return;
    const headers = ['Rank', 'Student ID', 'Name', 'Branch', 'CGPA', 'Match Score', 'Category', 'Eligible', 'Key Strengths', 'Missing Skills'];
    const rows = filteredCandidates.map(c => [
      c.rank,
      `"${c.student_id}"`,
      `"${c.student_name}"`,
      `"${c.branch || ''}"`,
      c.cgpa || '',
      c.match_score,
      `"${c.category}"`,
      c.eligible ? 'Yes' : 'No',
      `"${(c.strengths || []).join('; ')}"`,
      `"${(c.skill_gaps || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusLink_Candidates_${selectedJobId || 'Export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Filter candidates
  const filteredCandidates = (matchResult?.matches || []).filter(c => {
    const isShortlisted = !!shortlistMap[c.student_id];

    const matchesCategory =
      filterCategory === 'all' ||
      (filterCategory === 'shortlisted' && isShortlisted) ||
      (filterCategory === 'eligible' && c.eligible) ||
      (filterCategory === 'ineligible' && !c.eligible) ||
      c.category.toLowerCase() === filterCategory.toLowerCase();

    const matchesSearch =
      c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScore = c.match_score >= minScoreCutoff;
    const matchesBranch = selectedBranch === 'all' || (c.branch && c.branch.toUpperCase() === selectedBranch.toUpperCase());

    return matchesCategory && matchesSearch && matchesScore && matchesBranch;
  });

  const shortlistedCount = Object.keys(shortlistMap).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner: Role Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0e111a] border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span>Intelligent Candidate Matching</span>
              </span>
              {authService.isInstitutionAdmin(activeInst) ? (
                <button
                  onClick={() => navigate(`/${institution?.username || activeInst}`)}
                  className="font-mono text-xs text-slate-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                >
                  <span>← Return to Admin Console</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="font-mono text-xs text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>← Return to Global Gateway</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              {recruiter ? `${recruiter.company_name} Talent Pipeline` : 'AI-Ranked Campus Hiring Shortlist'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              {recruiter && (
                <span>
                  Hiring Lead: <strong className="text-white">{recruiter.name}</strong> ({recruiter.designation || 'Talent Lead'}) •{' '}
                </span>
              )}
              Cohort under <strong className="text-emerald-300 font-mono">{institution?.name || activeInst}</strong>.
              Instant talent evaluation across academic cutoffs, hands-on project experience, and verified technical skills.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded border border-white/[0.06] bg-white/[0.02]">
                ACTIVE POOL: {matchResult?.total_evaluated || '30+'} PROFILES
              </span>
              <span className="px-2 py-0.5 rounded border border-white/[0.06] bg-white/[0.02]">
                EVALUATION: MULTI-FACTOR PROFILE MATCHING
              </span>
              <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-300">
                INSTANT SCREENING
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              onClick={() => navigate(`/${institution?.username || activeInst}/recruiter-registration`)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/[0.1] hover:border-white/[0.2] flex items-center space-x-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Post New Requisition</span>
            </button>
          </div>
        </div>
      </div>

      {/* Job Requisition Selector Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e111a] p-4 rounded-2xl border border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Requisitions:</span>
          </span>
          {jobs.map(job => {
            const isSelected = selectedJobId === job.id;
            return (
              <button
                key={job.id}
                onClick={() => handleSelectJob(job.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-white/[0.09] text-white border-white/[0.25] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                )}
                <span>{job.title}</span>
                <span className="font-mono text-[10.5px] text-slate-400 font-normal">
                  ({job.company})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => selectedJobId && fetchMatches(selectedJobId)}
            disabled={evaluating}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all active:scale-[0.98] shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${evaluating ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Pool</span>
          </button>

          <button
            onClick={() => setIsAutoShortlistOpen(true)}
            disabled={!selectedJobId || evaluating}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all active:scale-[0.98] shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
            title="Auto-shortlist candidates by Top N, Score threshold, or custom criteria"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>⚡ Auto-Shortlist</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredCandidates.length === 0}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-semibold transition-all active:scale-[0.98] shrink-0 disabled:opacity-40"
            title="Download CSV of evaluated candidates"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Selected Job Requirements Blueprint & Cutoffs Cockpit */}
      {selectedJob && (
        <div className="p-6 rounded-3xl bg-[#0e111a] border border-white/[0.08] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                {selectedJob.title}
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                {selectedJob.company}
              </span>
              {shortlistedCount > 0 && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center space-x-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{shortlistedCount} SHORTLISTED</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {selectedJob.description}
            </p>

            {/* Required Skills & Preferred Skills Matrix */}
            <div className="flex flex-wrap gap-2 pt-2 items-center">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Required Core:
              </span>
              {selectedJob.required_skills?.map((sk, i) => (
                <span
                  key={i}
                  className="font-mono px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/25"
                >
                  {sk}
                </span>
              ))}

              {selectedJob.preferred_skills && selectedJob.preferred_skills.length > 0 && (
                <>
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Preferred:
                  </span>
                  {selectedJob.preferred_skills.map((sk, i) => (
                    <span
                      key={i}
                      className="font-mono px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 text-xs font-medium border border-sky-500/25"
                    >
                      {sk}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Hard Cutoffs Summary Box */}
          <div className="bg-[#121622] p-5 rounded-2xl border border-white/[0.08] flex flex-col justify-between text-xs space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 uppercase tracking-wider font-semibold border-b border-white/[0.06] pb-2">
              <span>Eligibility Cutoffs</span>
              <span className="text-emerald-400 text-[10px]">Mandatory</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Minimum CGPA Threshold:</span>
                <span className="font-mono font-bold text-white tabular-nums bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  {selectedJob.minimum_cgpa.toFixed(1)} / 10.0
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Max Active Backlogs:</span>
                <span className="font-mono font-bold text-white tabular-nums bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  {selectedJob.max_backlogs} Allowed
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Eligible Disciplines:</span>
                <span className="font-mono font-semibold text-emerald-300 text-[11px]">
                  {selectedJob.eligible_branches?.join(', ') || 'All Disciplines'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Metric Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        
        {/* Search & Extra Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, skill, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e111a] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Branch Dropdown */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-[#0e111a] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono transition-colors"
          >
            <option value="all">All Disciplines</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>

          {/* Min Score Slider */}
          <div className="flex items-center space-x-2.5 bg-[#0e111a] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs">
            <span className="font-mono text-slate-400 text-[11px] uppercase">Min Score:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScoreCutoff}
              onChange={e => setMinScoreCutoff(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-300 font-bold tabular-nums">{minScoreCutoff}%</span>
          </div>
        </div>

        {/* Category Filter Segments */}
        <div className="flex flex-wrap gap-1.5 bg-[#0e111a] p-1.5 rounded-xl border border-white/[0.08]">
          {[
            { id: 'all', label: 'All Candidates' },
            { id: 'shortlisted', label: `Shortlisted (${shortlistedCount})` },
            { id: 'highly suitable', label: 'Highly Suitable' },
            { id: 'suitable', label: 'Suitable' },
            { id: 'potential fit', label: 'Potential Fit' },
            { id: 'ineligible', label: 'Ineligible' },
          ].map(f => {
            const isActive = filterCategory === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
                  isActive
                    ? 'bg-white/[0.1] text-white border border-white/[0.2] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidates Grid & States */}
      {loading || evaluating ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Evaluating candidate profiles against role criteria...</span>
            </span>
            <span>Comprehensive Profile Evaluation</span>
          </div>
          {/* Agency Skeleton Loader Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div
                key={n}
                className="p-6 rounded-2xl bg-[#0e111a] border border-white/[0.06] space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
                    <div className="space-y-1.5">
                      <div className="w-28 h-4 rounded bg-white/[0.08]" />
                      <div className="w-16 h-3 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                  <div className="w-12 h-8 rounded-lg bg-white/[0.06]" />
                </div>
                <div className="pt-3 border-t border-white/[0.04] space-y-2">
                  <div className="w-full h-3 rounded bg-white/[0.04]" />
                  <div className="w-3/4 h-3 rounded bg-white/[0.04]" />
                </div>
                <div className="flex gap-1.5 pt-2">
                  <div className="w-14 h-4 rounded bg-white/[0.05]" />
                  <div className="w-14 h-4 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-rose-200 font-semibold text-sm">{error}</p>
          <button
            onClick={() => selectedJobId && fetchMatches(selectedJobId)}
            className="mt-3 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-mono font-medium hover:bg-rose-500/30 transition-colors"
          >
            Retry Match Evaluation
          </button>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="py-20 text-center text-slate-400 border border-white/[0.08] rounded-3xl bg-[#0e111a]/60 space-y-3">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-display text-base font-semibold text-white">No candidates match current filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Adjust your search query, reduce the minimum score threshold, or switch the candidate category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBranch('all');
              setMinScoreCutoff(0);
              setFilterCategory('all');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-slate-200 border border-white/[0.1] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Candidate Selection Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 px-1 py-1">
            <div className="flex items-center space-x-3">
              {filteredCandidates.filter(c => c.eligible).length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    filteredCandidates.filter(c => c.eligible).every(c => selectedCandidateIds.has(c.student_id))
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                      : 'bg-[#0e111a] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.2]'
                  }`}
                  title="Select or deselect all eligible candidates in view"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      filteredCandidates.filter(c => c.eligible).every(c => selectedCandidateIds.has(c.student_id))
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-500 bg-white/[0.02]'
                    }`}
                  >
                    {filteredCandidates.filter(c => c.eligible).every(c => selectedCandidateIds.has(c.student_id)) && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                  </div>
                  <span>Select All ({filteredCandidates.filter(c => c.eligible).length})</span>
                </button>
              )}

              <span>
                DISPLAYING <strong className="text-white">{filteredCandidates.length}</strong> EVALUATED CANDIDATE{filteredCandidates.length > 1 ? 'S' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {shortlistedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearShortlists}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1 font-mono cursor-pointer"
                  title="Wipe shortlists for this job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Job Shortlists ({shortlistedCount})</span>
                </button>
              )}
              <span className="text-[11px] text-slate-500">
                CLICK CARD TO INSPECT DOSSIER
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map(candidate => (
              <CandidateCard
                key={candidate.student_id}
                candidate={candidate}
                onOpenDetails={setSelectedCandidate}
                isShortlisted={!!shortlistMap[candidate.student_id]}
                onToggleShortlist={handleToggleShortlist}
                showCheckbox={true}
                isSelected={selectedCandidateIds.has(candidate.student_id)}
                onToggleSelect={handleToggleSelectCandidate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Batch Selection Bar */}
      {selectedCandidateIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0e111a]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] flex items-center space-x-4 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-200">
              Selected: <strong className="text-emerald-300 font-bold">{selectedCandidateIds.size}</strong> candidate{selectedCandidateIds.size > 1 ? 's' : ''}
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.1]" />

          <button
            type="button"
            onClick={handleBulkShortlistSelected}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Shortlist Selected ({selectedCandidateIds.size})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCandidateIds(new Set())}
            className="text-xs text-slate-400 hover:text-white font-mono transition-colors cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121622] border border-emerald-500/40 text-emerald-200 text-xs font-mono px-4 py-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_15px_rgba(16,185,129,0.2)] flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auto-Shortlist Cockpit Modal */}
      {selectedJob && (
        <AutoShortlistModal
          job={selectedJob}
          isOpen={isAutoShortlistOpen}
          onClose={() => setIsAutoShortlistOpen(false)}
          onSuccess={handleAutoShortlistSuccess}
          institutionId={activeInst}
        />
      )}

      {/* Candidate Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};

