import React from 'react';
import { Building2, GraduationCap, Briefcase, PlusCircle, Sparkles, Database } from 'lucide-react';

export type PortalType = 'institution' | 'student' | 'recruiter' | 'upload_job';

interface NavbarProps {
  currentPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
  dbType?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPortal, onSelectPortal, dbType = 'sqlite' }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectPortal('recruiter')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                CampusLink
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Placement Intelligence Platform
              </div>
            </div>
          </div>

          {/* Three-Portal Mode Switcher */}
          <nav className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => onSelectPortal('institution')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === 'institution'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Institution Portal</span>
            </button>

            <button
              onClick={() => onSelectPortal('student')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>

            <button
              onClick={() => onSelectPortal('recruiter')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === 'recruiter'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter Portal</span>
            </button>

            <button
              onClick={() => onSelectPortal('upload_job')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === 'upload_job'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-violet-400" />
              <span>Post Job</span>
            </button>
          </nav>

          {/* Database & System Status Badge */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="capitalize font-mono text-[11px]">{dbType}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 text-[11px]">System Online</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
