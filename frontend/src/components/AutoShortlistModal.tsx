import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  JobRequirements,
  AutoShortlistCriteria,
  AutoShortlistPreviewResponse
} from '../types';
import {
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Hash,
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AutoShortlistModalProps {
  job: JobRequirements;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  institutionId?: string;
}

export const AutoShortlistModal: React.FC<AutoShortlistModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
  institutionId
}) => {
  // Strategy selection
  const [strategy, setStrategy] = useState<'top_n' | 'min_score' | 'category' | 'custom'>('top_n');

  // Input states
  const [topNInput, setTopNInput] = useState<number>(10);
  const [minScore, setMinScore] = useState<number>(70);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Highly Suitable', 'Suitable']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['ALL']);
  const [minCgpa, setMinCgpa] = useState<number>(job.minimum_cgpa || 7.0);
  const [mustHaveAllCoreSkills, setMustHaveAllCoreSkills] = useState<boolean>(false);

  // Preview & execution states
  const [preview, setPreview] = useState<AutoShortlistPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoster, setShowRoster] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && job?.id) {
      fetchPreview();
    }
  }, [
    isOpen,
    job?.id,
    strategy,
    topNInput,
    minScore,
    selectedCategories,
    selectedBranches,
    minCgpa,
    mustHaveAllCoreSkills
  ]);

  const buildCriteria = (): AutoShortlistCriteria => {
    return {
      strategy,
      top_n: topNInput > 0 ? topNInput : 10,
      min_score: minScore,
      categories: selectedCategories,
      branches: selectedBranches.includes('ALL') ? undefined : selectedBranches,
      min_cgpa: strategy === 'custom' ? minCgpa : undefined,
      must_have_all_required_skills: strategy === 'custom' ? mustHaveAllCoreSkills : false,
      institution_id: institutionId,
      notes: `Auto-shortlisted via ${strategy.toUpperCase()} policy`
    };
  };

  const fetchPreview = async () => {
    try {
      setLoadingPreview(true);
      setError(null);
      const crit = buildCriteria();
      const res = await api.previewAutoShortlist(job.id, crit);
      setPreview(res);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message || 'Failed to generate shortlist preview.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      setError(null);
      const crit = buildCriteria();
      const res = await api.executeAutoShortlist(job.id, crit);
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to execute auto-shortlist.');
    } finally {
      setExecuting(false);
    }
  };

  const handleClearShortlists = async () => {
    try {
      setClearing(true);
      setError(null);
      const res = await api.clearJobShortlists(job.id);
      onSuccess(`Cleared all ${res.deleted_count} candidate shortlists for ${job.title}.`);
      setConfirmClear(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to clear shortlists.');
    } finally {
      setClearing(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBranch = (branch: string) => {
    if (branch === 'ALL') {
      setSelectedBranches(['ALL']);
      return;
    }
    const filtered = selectedBranches.filter(b => b !== 'ALL');
    if (filtered.includes(branch)) {
      const next = filtered.filter(b => b !== branch);
      setSelectedBranches(next.length ? next : ['ALL']);
    } else {
      setSelectedBranches([...filtered, branch]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0e111a] border border-white/[0.1] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-white">
                  Auto-Shortlist Engine
                </h2>
                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                  Zero Manual Clicks
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Requisition: <strong className="text-slate-200">{job.title}</strong> ({job.company})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Strategy Presets & Mode Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              <span className="flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shortlisting Strategy Mode</span>
              </span>
              <span className="text-slate-400">Deterministic Rule Policy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Preset: Top 10 */}
              <button
                type="button"
                onClick={() => {
                  setStrategy('top_n');
                  setTopNInput(10);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  strategy === 'top_n' && topNInput === 10
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                    : 'bg-[#121622] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Top 10 Preset</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm font-display font-bold text-white mt-1">Top 10 Ranked</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Highest composite scores</div>
              </button>

              {/* Strategy: Top X Custom Number */}
              <button
                type="button"
                onClick={() => setStrategy('top_n')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  strategy === 'top_n' && topNInput !== 10
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                    : 'bg-[#121622] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Custom Rank</span>
                  <Hash className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-sm font-display font-bold text-white mt-1">Top X Candidates</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Specify exact count N</div>
              </button>

              {/* Strategy: Score Cutoff */}
              <button
                type="button"
                onClick={() => setStrategy('min_score')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  strategy === 'min_score'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                    : 'bg-[#121622] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Score Cutoff</span>
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-sm font-display font-bold text-white mt-1">Score Threshold</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Match score ≥ Cutoff %</div>
              </button>

              {/* Strategy: Tier Categories */}
              <button
                type="button"
                onClick={() => setStrategy('category')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  strategy === 'category'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                    : 'bg-[#121622] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Suitability Tiers</span>
                  <Award className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-sm font-display font-bold text-white mt-1">Category Filter</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Highly Suitable & Suitable</div>
              </button>
            </div>
          </div>

          {/* Strategy-Specific Tuning Controls */}
          <div className="p-5 rounded-2xl bg-[#121622] border border-white/[0.06] space-y-4">
            
            {/* If Top N or Custom Rank */}
            {strategy === 'top_n' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-emerald-400" />
                      <span>Number of Top Candidates to Shortlist (Top X):</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter any integer or pick from quick presets. Shortlists the highest-scoring eligible students.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={topNInput}
                      onChange={e => setTopNInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 bg-[#090a0f] border border-white/[0.1] rounded-xl px-3 py-1.5 font-mono text-center text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-500/50"
                    />
                    <span className="font-mono text-slate-400 text-xs">Candidates</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">Quick Jump:</span>
                  {[5, 10, 15, 20, 25, 30].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTopNInput(n)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                        topNInput === n
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      Top {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Score Threshold */}
            {strategy === 'min_score' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Minimum Match Score Cutoff:</span>
                  </label>
                  <span className="font-mono text-emerald-300 text-base font-bold tabular-nums">
                    {minScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={95}
                  step={5}
                  value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>Relaxed (40%)</span>
                  <span>Moderate (70%)</span>
                  <span>Strict (85%+)</span>
                </div>
              </div>
            )}

            {/* If Category Tier */}
            {strategy === 'category' && (
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-200">
                  Include Candidates in Tiers:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Highly Suitable', 'Suitable', 'Potential Fit'].map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strategy: Custom Matrix Filter */}
            <div className="pt-2 border-t border-white/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase text-slate-400 font-semibold flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Optional Discipline Filtering:</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedBranches.join(', ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'MECH'].map(br => {
                  const isChecked = selectedBranches.includes(br);
                  return (
                    <button
                      key={br}
                      type="button"
                      onClick={() => toggleBranch(br)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                        isChecked
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                          : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      {br}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Live Impact Telemetry Cockpit */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0e111a] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <span className="flex items-center space-x-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingPreview ? 'animate-spin' : ''}`} />
                <span>Simulated Impact Telemetry</span>
              </span>
              <span>Full Evaluated Pool: {preview?.total_evaluated ?? 30} Candidates</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Qualified</div>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {preview?.total_qualified ?? '—'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Meet criteria</div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="text-[10px] font-mono text-emerald-300 uppercase font-semibold">New to Add</div>
                <div className="text-2xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">
                  +{preview?.newly_shortlisted_count ?? '—'}
                </div>
                <div className="text-[10px] text-emerald-300/80 mt-0.5">Will be created</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <div className="text-[10px] font-mono text-amber-300 uppercase font-semibold">Already Saved</div>
                <div className="text-2xl font-bold font-mono text-amber-300 mt-1 tabular-nums">
                  {preview?.already_shortlisted_count ?? '—'}
                </div>
                <div className="text-[10px] text-amber-300/80 mt-0.5">Preserved in DB</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Match Score</div>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {preview?.avg_match_score ? `${preview.avg_match_score}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Batch average</div>
              </div>
            </div>
          </div>

          {/* Collapsible Candidate Roster Drawer */}
          <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRoster(!showRoster)}
              className="w-full p-3.5 bg-[#121622] hover:bg-white/[0.03] transition-colors flex items-center justify-between font-mono text-xs text-slate-300"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Candidate Preview Roster ({preview?.candidates.length || 0})</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                <span>{showRoster ? 'Hide List' : 'Inspect Candidates'}</span>
                {showRoster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showRoster && (
              <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.04] bg-[#090a0f]">
                {preview?.candidates && preview.candidates.length > 0 ? (
                  preview.candidates.map(cand => (
                    <div
                      key={cand.student_id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-[11px] font-bold text-slate-400 w-8">
                          #{cand.rank}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{cand.student_name}</div>
                          <div className="text-[10.5px] font-mono text-slate-400">
                            {cand.branch} • CGPA {cand.cgpa.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        <div>
                          <div className="font-mono font-bold text-emerald-300 text-sm">
                            {cand.match_score.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{cand.category}</div>
                        </div>

                        {cand.already_shortlisted ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-semibold">
                            Existing
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-semibold">
                            + To Shortlist
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 font-mono text-xs">
                    No candidates match the specified criteria. Try relaxing cutoffs.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="relative z-10 px-6 py-4 bg-[#0a0d14] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Clear Shortlists Action */}
          <div>
            {confirmClear ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-rose-300 font-mono">Wipe all shortlists for this job?</span>
                <button
                  type="button"
                  onClick={handleClearShortlists}
                  disabled={clearing}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold transition-colors"
                >
                  {clearing ? 'Clearing...' : 'Yes, Wipe All'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white font-mono text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-mono transition-colors flex items-center space-x-1.5"
                title="Remove all current shortlists for this job"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset / Clear Shortlists</span>
              </button>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={executing || !preview || preview.total_qualified === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {executing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Executing Shortlist...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>
                    Auto-Shortlist {preview?.newly_shortlisted_count ? `${preview.newly_shortlisted_count} New Candidates` : `${preview?.total_qualified || 0} Candidates`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
