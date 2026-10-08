import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobRequirements, JobMatchResult, CandidateMatchItem, ApplicationRecord, Recruiter, Institution } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateModal } from '../components/CandidateModal';
import { Briefcase, Filter, Search, Users, Sparkles, AlertCircle, RefreshCw, Star, Download, Sliders, PlusCircle, ArrowLeft } from 'lucide-react';

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
      } catch (err) {
        console.error('Failed to shortlist candidate:', err);
      }
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-semibold mb-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Recruiter Candidate Matching Console</span>
              </span>
              <button
                onClick={() => navigate(`/${institution?.username || activeInst}`)}
                className="text-xs text-sky-400 hover:text-sky-300 underline"
              >
                ← {institution?.name || 'Campus Dashboard'}
              </button>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {recruiter ? `${recruiter.company_name} Talent Pipeline` : 'AI-Ranked Campus Hiring Shortlist'}
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              {recruiter && (
                <span>
                  Hiring Lead: <strong className="text-white">{recruiter.name}</strong> ({recruiter.designation || 'Talent Lead'}) •{' '}
                </span>
              )}
              Campus: <strong className="text-indigo-300">{institution?.name || activeInst}</strong>.
              Evaluating student cohort using deterministic hard eligibility criteria, 6-factor weighted multi-dimensional scoring, and fact-grounded explainability.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 self-start md:self-center">
            <button
              onClick={() => navigate(`/${institution?.username || activeInst}/recruiter-registration`)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 border border-slate-700 flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register New Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Job Requisition Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Active Roles:
          </span>
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => handleSelectJob(job.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                selectedJobId === job.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {job.title} <span className="text-slate-400 font-normal">({job.company})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => selectedJobId && fetchMatches(selectedJobId)}
            disabled={evaluating}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>Re-evaluate Pool</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredCandidates.length === 0}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
            title="Download CSV of evaluated candidates"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Selected Job Requirements Card */}
      {selectedJob && (
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                {selectedJob.company}
              </span>
              {shortlistedCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{shortlistedCount} Shortlisted</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {selectedJob.description}
            </p>

            {/* Required Skills & Preferred Skills */}
            <div className="flex flex-wrap gap-2 pt-2 items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required:</span>
              {selectedJob.required_skills?.map((sk, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 text-xs font-medium border border-indigo-800/50">
                  {sk}
                </span>
              ))}

              {selectedJob.preferred_skills && selectedJob.preferred_skills.length > 0 && (
                <>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-2">Preferred:</span>
                  {selectedJob.preferred_skills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                      {sk}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Hard Cutoffs Summary Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between text-xs space-y-2">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Hard Eligibility Cutoffs</div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400">Minimum CGPA:</span>
              <span className="font-bold text-slate-100">{selectedJob.minimum_cgpa.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800">
              <span className="text-slate-400">Max Active Backlogs:</span>
              <span className="font-bold text-slate-100">{selectedJob.max_backlogs}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Disciplines:</span>
              <span className="font-bold text-slate-100 font-mono">
                {selectedJob.eligible_branches?.join(', ') || 'All'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Metric Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        
        {/* Search & Extra Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, skill, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Branch Dropdown */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Disciplines</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>

          {/* Min Score Slider */}
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">Min Score:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScoreCutoff}
              onChange={e => setMinScoreCutoff(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono text-indigo-300 font-bold">{minScoreCutoff}%</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Candidates' },
            { id: 'shortlisted', label: `Shortlisted (${shortlistedCount})` },
            { id: 'highly suitable', label: 'Highly Suitable' },
            { id: 'suitable', label: 'Suitable' },
            { id: 'potential fit', label: 'Potential Fit' },
            { id: 'ineligible', label: 'Ineligible' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filterCategory === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      {loading || evaluating ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Computing 6-factor candidate match scores...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-rose-300 font-semibold text-sm">{error}</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="py-16 text-center text-slate-400 border border-slate-800 rounded-2xl">
          <p className="text-sm">No candidates match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map(candidate => (
            <CandidateCard
              key={candidate.student_id}
              candidate={candidate}
              onOpenDetails={setSelectedCandidate}
              isShortlisted={!!shortlistMap[candidate.student_id]}
              onToggleShortlist={handleToggleShortlist}
            />
          ))}
        </div>
      )}

      {/* Candidate Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
