import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, GraduationCap, LogOut, ShieldCheck, User, LogIn } from 'lucide-react';
import { authService } from '../services/auth';
import { Institution, LoggedInStudent } from '../types';

interface NavbarProps {
  dbType?: string;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();

  const [loggedInInstitution, setLoggedInInstitution] = useState<Institution | null>(
    authService.getLoggedInInstitution()
  );
  const [loggedInStudent, setLoggedInStudent] = useState<LoggedInStudent | null>(
    authService.getLoggedInStudent()
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setLoggedInInstitution(authService.getLoggedInInstitution());
      setLoggedInStudent(authService.getLoggedInStudent());
    };

    window.addEventListener('campuslink-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('campuslink-auth-change', handleAuthChange);
    };
  }, []);

  const currentSlug = loggedInInstitution?.username || loggedInInstitution?.id;

  const handleLogoClick = () => {
    if (loggedInInstitution) {
      navigate(`/${currentSlug}`);
    } else if (loggedInStudent) {
      navigate(`/${loggedInStudent.institution_id}/student/${loggedInStudent.id}`);
    } else {
      navigate('/');
    }
  };

  const handleLogoutInstitution = () => {
    authService.logoutInstitution();
    navigate('/');
  };

  const handleLogoutStudent = () => {
    const targetSlug = loggedInStudent?.institution_id || 'apex-inst';
    authService.logoutStudent();
    navigate(`/${targetSlug}/student-login`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="text-lg font-display font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                CampusLink
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 font-medium">
                {loggedInInstitution
                  ? loggedInInstitution.name
                  : loggedInStudent
                  ? `Candidate: ${loggedInStudent.name}`
                  : 'Placement Intelligence Monolith'}
              </div>
            </div>
          </div>

          {/* Right Navigation & Session Status */}
          <div className="flex items-center space-x-3">
            {loggedInInstitution ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-200 truncate max-w-[150px]">
                    {loggedInInstitution.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase">
                    Admin
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/${currentSlug}`)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-200 border border-white/[0.08] transition-colors"
                >
                  Console
                </button>

                <button
                  onClick={handleLogoutInstitution}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-mono transition-colors"
                  title="Lock Console & Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock Console</span>
                </button>
              </div>
            ) : loggedInStudent ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-200 truncate max-w-[150px]">
                    {loggedInStudent.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-mono font-bold uppercase">
                    {loggedInStudent.id}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/${loggedInStudent.institution_id}/student/${loggedInStudent.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-200 border border-white/[0.08] transition-colors"
                >
                  My Dossier
                </button>

                <button
                  onClick={handleLogoutStudent}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-mono transition-colors"
                  title="Log Out Student Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/apex-inst/student-login')}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-slate-300 hover:text-white border border-white/[0.08] transition-colors flex items-center space-x-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Candidate Login</span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/30 transition-colors flex items-center space-x-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Gateway</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
export default Navbar;
