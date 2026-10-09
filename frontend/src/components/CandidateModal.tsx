import React, { useEffect } from 'react';
import { CandidateMatchItem } from '../types';
import { X, CheckCircle2, AlertOctagon, Sparkles, BookOpen, Layers, Award, ShieldCheck } from 'lucide-react';

interface CandidateModalProps {
  candidate: CandidateMatchItem | null;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const { breakdown } = candidate;

  const factors = [
    { label: 'Technical Skills Overlap', score: breakdown.skills, weight: '40%', barGradient: 'from-emerald-500 to-teal-400' },
    { label: 'Semantic Project Alignment', score: breakdown.projects, weight: '20%', barGradient: 'from-sky-500 to-cyan-400' },
    { label: 'Academic Standing (CGPA)', score: breakdown.academics, weight: '15%', barGradient: 'from-emerald-400 to-green-500' },
    { label: 'Standardized Assessment', score: breakdown.assessment, weight: '10%', barGradient: 'from-teal-400 to-emerald-400' },
    { label: 'Professional Certifications', score: breakdown.certifications, weight: '10%', barGradient: 'from-amber-400 to-amber-500' },
    { label: 'Professional Communication', score: breakdown.communication, weight: '5%', barGradient: 'from-rose-400 to-pink-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#090a0f]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0e111a] border border-white/[0.1] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] p-6 sm:p-8 space-y-6">
        
        {/* Top ambient hairline glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dossier Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-3">
          <div className="flex items-center space-x-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Candidate Intelligence Dossier</span>
            <span className="text-slate-600">//</span>
            <span className="text-slate-400">Deterministic Audit Record</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {candidate.student_name}
                </h2>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/[0.03] text-slate-300 border border-white/[0.08]">
                  {candidate.student_id}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2 font-mono">
                <span>Discipline: <strong className="text-slate-200">{candidate.branch}</strong></span>
                <span className="text-slate-600">•</span>
                <span>CGPA: <strong className="text-slate-200">{candidate.cgpa.toFixed(2)}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">{candidate.category}</span>
              </div>
            </div>

            {/* Score HUD */}
            <div className="flex items-center space-x-4 self-start sm:self-auto bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 rounded-2xl">
              <div className="text-right">
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Composite Match</div>
                <div className="font-mono text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 tabular-nums">
                  {candidate.eligible ? `${candidate.match_score.toFixed(1)}%` : '0.0%'}
                </div>
              </div>
              <div
                className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  !candidate.eligible
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : candidate.rank === 1
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {candidate.eligible ? `№ ${candidate.rank < 10 ? `0${candidate.rank}` : candidate.rank}` : 'Disqualified'}
              </div>
            </div>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#131726]/40 to-transparent border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center space-x-2 font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grounded Explainability & Reasoning</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {candidate.explanation}
          </p>
        </div>

        {/* 6-Factor Multi-Dimensional Telemetry Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>6-Factor Weighted Scoring Telemetry</span>
            </h3>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Deterministic Weights
            </span>
          </div>

          <div className="space-y-2.5">
            {factors.map((f, i) => (
              <div key={i} className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="font-medium text-slate-300">
                    {f.label} <span className="font-mono text-slate-400 text-[10.5px]">({f.weight} weight)</span>
                  </div>
                  <div className="font-mono font-bold text-slate-100 tabular-nums">
                    {f.score.toFixed(1)} <span className="text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="w-full bg-[#090a0f] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 bg-gradient-to-r ${f.barGradient}`}
                    style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Missing Required Skills */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center space-x-2 font-mono text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Critical Required Gaps</span>
            </div>
            {candidate.skill_gaps && candidate.skill_gaps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {candidate.skill_gaps.map((skill, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero mandatory gaps! Complete requirements match.</span>
              </div>
            )}
          </div>

          {/* Missing Preferred Skills */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
            <div className="flex items-center space-x-2 font-mono text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Preferred Scope Gaps</span>
            </div>
            {candidate.preferred_skill_gaps && candidate.preferred_skill_gaps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {candidate.preferred_skill_gaps.map((skill, i) => (
                  <span
                    key={i}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All preferred bonus skills fulfilled.</span>
              </div>
            )}
          </div>

        </div>

        {/* Verified Strengths List */}
        {candidate.strengths && candidate.strengths.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-3.5 h-3.5" />
              <span>Ground-Truth Strengths & Empirical Signals</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {candidate.strengths.map((str, i) => (
                <li key={i} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};
