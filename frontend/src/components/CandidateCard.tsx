import React from 'react';
import { CandidateMatchItem } from '../types';
import { Award, AlertTriangle, CheckCircle2, ChevronRight, Ban, Star } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateMatchItem;
  onOpenDetails: (candidate: CandidateMatchItem) => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (candidate: CandidateMatchItem) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onOpenDetails,
  isShortlisted = false,
  onToggleShortlist
}) => {
  const isTopRank = candidate.rank <= 3 && candidate.eligible;

  const categoryColor = () => {
    switch (candidate.category) {
      case 'Highly Suitable':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Suitable':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'Potential Fit':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Ineligible':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(candidate)}
      className={`relative group p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
        !candidate.eligible
          ? 'bg-slate-800/40 border-slate-800/80 hover:border-slate-700 opacity-80'
          : isTopRank
          ? 'bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-indigo-950/30 border-indigo-500/40 hover:border-indigo-500 shadow-lg shadow-indigo-950/20'
          : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/90'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Rank & Candidate Details */}
        <div className="flex items-start space-x-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              !candidate.eligible
                ? 'bg-rose-950/40 border-rose-800/50 text-rose-400'
                : candidate.rank === 1
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                : candidate.rank === 2
                ? 'bg-slate-300/20 border-slate-300/50 text-slate-200'
                : candidate.rank === 3
                ? 'bg-amber-700/20 border-amber-700/50 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {candidate.eligible ? `#${candidate.rank}` : <Ban className="w-4 h-4 text-rose-400" />}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {candidate.student_name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 font-mono">
                {candidate.branch}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              CGPA: <span className="font-semibold text-slate-200">{candidate.cgpa}</span>
            </div>
          </div>
        </div>

        {/* Right: Match Score Ring, Badge & Shortlist */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end space-x-2">
            {onToggleShortlist && candidate.eligible && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShortlist(candidate);
                }}
                className={`p-1 rounded-lg border transition-all ${
                  isShortlisted
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-850 text-slate-400 border-slate-700/80 hover:text-white hover:border-slate-600'
                }`}
                title={isShortlisted ? 'Remove from Shortlist' : 'Shortlist Candidate'}
              >
                <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
            <div className="flex items-baseline justify-end space-x-1">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  !candidate.eligible
                    ? 'text-rose-400'
                    : candidate.match_score >= 85
                    ? 'text-emerald-400'
                    : candidate.match_score >= 70
                    ? 'text-indigo-400'
                    : 'text-amber-400'
                }`}
              >
                {candidate.eligible ? `${candidate.match_score}` : '0.0'}
              </span>
              <span className="text-xs text-slate-500 font-medium">%</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-1 mt-1">
            {isShortlisted && (
              <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SHORTLISTED
              </span>
            )}
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor()}`}
            >
              {candidate.category}
            </span>
          </div>
        </div>
      </div>

      {/* Ground-truth Strengths or Ineligibility Reasons */}
      <div className="mt-4 pt-3.5 border-t border-slate-700/50">
        {candidate.eligible ? (
          candidate.strengths && candidate.strengths.length > 0 ? (
            <div className="space-y-1.5">
              {candidate.strengths.slice(0, 2).map((str, i) => (
                <div key={i} className="flex items-start text-xs text-slate-300 space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{str}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 line-clamp-1 italic">{candidate.explanation}</p>
          )
        ) : (
          <div className="space-y-1 text-xs text-rose-300/90">
            <div className="flex items-center space-x-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Hard Eligibility Disqualification:</span>
            </div>
            {candidate.ineligibility_reasons?.map((reason, idx) => (
              <p key={idx} className="text-slate-400 pl-4 text-[11px]">• {reason}</p>
            ))}
          </div>
        )}
      </div>

      {/* Skill Gaps Chips */}
      {candidate.eligible && candidate.skill_gaps && candidate.skill_gaps.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1">Missing:</span>
          {candidate.skill_gaps.slice(0, 3).map((gap, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20"
            >
              {gap}
            </span>
          ))}
          {candidate.skill_gaps.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{candidate.skill_gaps.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Hover Arrow */}
      <div className="mt-3 flex items-center justify-end text-xs font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">
        <span>View Full Breakdown</span>
        <ChevronRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
