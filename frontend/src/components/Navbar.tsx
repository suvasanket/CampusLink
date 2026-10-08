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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              if (loggedInInstitution) {
                navigate(`/${currentSlug}`);
              } else {
                navigate('/');
              }
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                CampusLink
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {loggedInInstitution ? loggedInInstitution.name : 'Placement Intelligence Platform'}
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isDashboardActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/60 border border-slate-700/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Institution Dashboard</span>
                </button>

                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  title="Logout from Institution Session"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800/50 text-xs font-semibold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              /* When not logged in: Institution Login option */
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Institution Login</span>
              </button>
            )}

            {/* Database Engine Tag */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-mono">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="capitalize">{dbType}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
