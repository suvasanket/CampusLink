import React, { useState, useEffect } from 'react';
import { Navbar, PortalType } from './components/Navbar';
import { RecruiterPortal } from './pages/RecruiterPortal';
import { StudentPortal } from './pages/StudentPortal';
import { InstitutionPortal } from './pages/InstitutionPortal';
import { JobUploadPage } from './pages/JobUploadPage';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentPortal, setCurrentPortal] = useState<PortalType>('recruiter');
  const [dbType, setDbType] = useState<string>('sqlite');

  useEffect(() => {
    // Check backend health and active database type on boot
    api.getHealth()
      .then(res => {
        if (res.database) setDbType(res.database);
      })
      .catch(() => {
        setDbType('offline-fixture');
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Universal Top Header with Three-Portal Switcher */}
      <Navbar
        currentPortal={currentPortal}
        onSelectPortal={setCurrentPortal}
        dbType={dbType}
      />

      {/* Main Portal Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPortal === 'recruiter' && <RecruiterPortal />}
        {currentPortal === 'student' && <StudentPortal />}
        {currentPortal === 'institution' && <InstitutionPortal />}
        {currentPortal === 'upload_job' && (
          <JobUploadPage onJobCreated={() => setCurrentPortal('recruiter')} />
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">CampusLink</span>
            <span>—</span>
            <span>AI-Assisted University Placement Intelligence Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>FastAPI Backend Monolith</span>
            <span>•</span>
            <span className="capitalize">{dbType} Storage Engine</span>
            <span>•</span>
            <span>Deterministic Scoring</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
