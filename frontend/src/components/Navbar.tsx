import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Sparkles, LogOut, Database } from 'lucide-react';
import { authService } from '../services/auth';
import { Institution } from '../types';

interface NavbarProps {
  dbType?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ dbType = 'sqlite' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedInInstitution, setLoggedInInstitution] = useState<Institution | null>(
    authService.getLoggedInInstitution()
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setLoggedInInstitution(authService.getLoggedInInstitution());
    };

    window.addEventListener('campuslink-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('campuslink-auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const currentSlug = loggedInInstitution?.username || loggedInInstitution?.id;
  const isDashboardActive = currentSlug && location.pathname.startsWith(`/${currentSlug}`);

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => {
              if (loggedInInstitution) {
                navigate(`/${currentSlug}`);
              } else {
                navigate('/');
              }
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="text-lg font-display font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                CampusLink
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-slate-400 font-medium">
                {loggedInInstitution ? loggedInInstitution.name : 'Placement Intelligence Monolith'}
              </div>
            </div>
          </div>

          {/* Upper Nav: Only Show Institution Dashboard (All other tabs removed) */}
          <div className="flex items-center space-x-3">
            {loggedInInstitution ? (
              <>
                {/* Single Upper Tab: Institution Dashboard */}
                <button
                  onClick={() => navigate(`/${currentSlug}`)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isDashboardActive
                      ? 'bg-white/[0.1] text-white border border-white/[0.2] shadow-sm'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Institution Dashboard</span>
                </button>

                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  title="Logout from Institution Session"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              /* When not logged in: Institution Login option */
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Institution Login</span>
              </button>
            )}

            {/* Database Engine Telemetry Tag */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[10.5px] font-mono">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="capitalize">{dbType}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
