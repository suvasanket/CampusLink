import React from 'react';
import { CandidateMatchItem } from '../types';
import { X, CheckCircle2, AlertOctagon, Sparkles, BookOpen, Layers, Award } from 'lucide-react';

interface CandidateModalProps {
  candidate: CandidateMatchItem | null;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const { breakdown } = candidate;

  const factors = [
    { label: 'Technical Skills Overlap', score: breakdown.skills, weight: '40%', color: 'bg-indigo-500' },
    { label: 'Semantic Project Alignment', score: breakdown.projects, weight: '20%', color: 'bg-violet-500' },
    { label: 'Academic Standing (CGPA)', score: breakdown.academics, weight: '15%', color: 'bg-emerald-500' },
    { label: 'Standardized Assessment', score: breakdown.assessment, weight: '10%', color: 'bg-sky-500' },
    { label: 'Professional Certifications', score: breakdown.certifications, weight: '10%', color: 'bg-amber-500' },
    { label: 'Professional Communication', score: breakdown.communication, weight: '5%', color: 'bg-pink-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white">{candidate.student_name}</h2>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
                {candidate.student_id}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
              <span>Branch: <strong className="text-slate-200">{candidate.branch}</strong></span>
              <span>•</span>
              <span>CGPA: <strong className="text-slate-200">{candidate.cgpa}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Composite Score</div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400">
                {candidate.eligible ? `${candidate.match_score}%` : '0%'}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              {candidate.eligible ? `Rank #${candidate.rank}` : 'Disqualified'}
            </div>
          </div>
        </div>

        {/* Explainability Section */}
        <div className="mt-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Grounded Explainability Summary</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {candidate.explanation}
          </p>
        </div>

        {/* 6-Factor Multi-Factor Breakdown */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>6-Factor Multi-Dimensional Score Breakdown</span>
          </h3>

          <div className="space-y-3.5">
            {factors.map((f, i) => (
              <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <div className="font-medium text-slate-300">
                    {f.label} <span className="text-slate-500 text-[11px]">({f.weight} weight)</span>
                  </div>
                  <div className="font-bold text-slate-200 font-mono">
                    {f.score.toFixed(1)} / 100
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${f.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis Section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Missing Required Skills */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
              <AlertOctagon className="w-4 h-4" />
              <span>Missing Required Skills (Critical Gaps)</span>
            </div>
            {candidate.skill_gaps && candidate.skill_gaps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skill_gaps.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero mandatory skill gaps! Complete coverage.</span>
              </div>
            )}
          </div>

          {/* Missing Preferred Skills */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4" />
              <span>Missing Preferred Skills (Bonus Scope)</span>
            </div>
            {candidate.preferred_skill_gaps && candidate.preferred_skill_gaps.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.preferred_skill_gaps.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All preferred bonus skills covered.</span>
              </div>
            )}
          </div>

        </div>

        {/* Strengths List */}
        {candidate.strengths && candidate.strengths.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Ground-Truth Strengths & Key Signals</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {candidate.strengths.map((str, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};
