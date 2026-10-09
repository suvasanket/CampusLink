import React from 'react';
import { CandidateMatchItem } from '../types';
import { AlertTriangle, CheckCircle2, ChevronRight, Ban, Star, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateMatchItem;
  onOpenDetails: (candidate: CandidateMatchItem) => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (candidate: CandidateMatchItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (candidate: CandidateMatchItem) => void;
  showCheckbox?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onOpenDetails,
  isShortlisted = false,
  onToggleShortlist,
  isSelected = false,
  onToggleSelect,
  showCheckbox = false
}) => {

  const isTopRank = candidate.rank <= 3 && candidate.eligible;

  const categoryBadge = () => {
    switch (candidate.category) {
      case 'Highly Suitable':
        return {
          classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
        };
      case 'Suitable':
        return {
          classes: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
          dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
        };
      case 'Potential Fit':
        return {
          classes: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
        };
      case 'Ineligible':
        return {
          classes: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400'
        };
      default:
        return {
          classes: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          dot: 'bg-slate-400'
        };
    }
  };

  const badge = categoryBadge();

  // Monogram initials
  const initials = candidate.student_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={() => onOpenDetails(candidate)}
      className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'ring-2 ring-emerald-500/60 border-emerald-500/50 bg-[#111724]'
          : !candidate.eligible
          ? 'bg-[#0e111a]/50 border-white/[0.05] hover:border-white/[0.12] opacity-75'
          : isTopRank
          ? 'bg-gradient-to-b from-[#131726]/90 to-[#0e111a]/95 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85),0_0_25px_-5px_rgba(16,185,129,0.15)] hover:-translate-y-0.5'
          : 'bg-[#0e111a]/85 border-white/[0.07] hover:border-white/[0.18] shadow-[0_10px_25px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)] hover:-translate-y-0.5'
      } active:scale-[0.99]`}
    >
      {/* Top Accent Light for Top 3 */}
      {isTopRank && (
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      )}

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Rank + Monogram + Identity & Score */}
        <div className="flex items-start justify-between gap-3">
          
          {/* Identity & Rank */}
          <div className="flex items-start space-x-3 min-w-0">
            {/* Multi-select checkbox */}
            {showCheckbox && candidate.eligible && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect && onToggleSelect(candidate);
                }}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-150 shrink-0 mt-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'bg-white/[0.04] border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.08] text-transparent'
                }`}
                title={isSelected ? 'Deselect candidate' : 'Select candidate'}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                !candidate.eligible
                  ? 'bg-rose-950/30 border-rose-800/40 text-rose-400'
                  : candidate.rank === 1
                  ? 'bg-gradient-to-b from-amber-500/20 to-amber-900/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]'
                  : candidate.rank === 2
                  ? 'bg-gradient-to-b from-slate-200/20 to-slate-800/10 border-slate-300/40 text-slate-100'
                  : candidate.rank === 3
                  ? 'bg-gradient-to-b from-amber-700/20 to-slate-900/20 border-amber-700/40 text-amber-300/90'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
              }`}
            >
              {candidate.eligible ? (
                <span>№{candidate.rank < 10 ? `0${candidate.rank}` : candidate.rank}</span>
              ) : (
                <Ban className="w-4 h-4 text-rose-400" />
              )}
            </div>

            {/* Candidate Name & Specs */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-display font-semibold text-white tracking-tight truncate group-hover:text-emerald-300 transition-colors">
                  {candidate.student_name}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.03] text-slate-300">
                  {candidate.branch}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] tabular-nums text-slate-300">
                  CGPA <strong className="text-white font-medium">{candidate.cgpa.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Gauge & Bookmark */}
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end space-x-2">
              {onToggleShortlist && candidate.eligible && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onToggleShortlist(candidate);
                  }}
                  className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isShortlisted
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] scale-105'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.2] hover:bg-white/[0.05]'
                  }`}
                  title={isShortlisted ? 'Click to remove from Shortlist' : 'Click to Shortlist Candidate'}
                >
                  <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              )}


              {/* Match Score Percentage */}
              <div className="flex items-baseline space-x-0.5">
                <span
                  className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${
                    !candidate.eligible
                      ? 'text-rose-400'
                      : candidate.match_score >= 85
                      ? 'text-emerald-300'
                      : candidate.match_score >= 70
                      ? 'text-sky-300'
                      : 'text-amber-300'
                  }`}
                >
                  {candidate.eligible ? candidate.match_score.toFixed(1) : '0.0'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">%</span>
              </div>
            </div>

            {/* Status Beacon & Category */}
            <div className="flex items-center justify-end space-x-1.5 mt-1.5">
              {isShortlisted && (
                <span className="font-mono text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 text-amber-300 uppercase">
                  SHORTLISTED
                </span>
              )}
              <span
                className={`inline-flex items-center space-x-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${badge.classes}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                <span>{candidate.category}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Fact-Grounded Evidence Section */}
        <div className="pt-3 border-t border-white/[0.06]">
          {candidate.eligible ? (
            candidate.strengths && candidate.strengths.length > 0 ? (
              <div className="space-y-1.5">
                {candidate.strengths.slice(0, 2).map((str, i) => (
                  <div key={i} className="flex items-start text-xs text-slate-300/90 space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1 text-slate-300 font-normal">{str}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 line-clamp-1 italic">{candidate.explanation}</p>
            )
          ) : (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 font-medium text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Eligibility Disqualification:</span>
              </div>
              {candidate.ineligibility_reasons?.map((reason, idx) => (
                <p key={idx} className="text-slate-400 pl-5 text-[11px] font-mono">• {reason}</p>
              ))}
            </div>
          )}
        </div>

        {/* Skill Gap Chips */}
        {candidate.eligible && candidate.skill_gaps && candidate.skill_gaps.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="font-mono text-[9.5px] uppercase font-semibold text-slate-400 tracking-wider mr-0.5">
              Deficits:
            </span>
            {candidate.skill_gaps.slice(0, 3).map((gap, i) => (
              <span
                key={i}
                className="font-mono text-[10px] px-2 py-0.5 rounded border border-rose-500/25 bg-rose-500/10 text-rose-300"
              >
                {gap}
              </span>
            ))}
            {candidate.skill_gaps.length > 3 && (
              <span className="font-mono text-[10px] text-slate-400">
                +{candidate.skill_gaps.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Agency Telemetry Bar */}
      <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-300 transition-colors">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          ID: {candidate.student_id}
        </span>
        <div className="flex items-center space-x-1 font-medium text-xs">
          <span>Inspect Dossier</span>
          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
