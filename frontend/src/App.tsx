import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { InstitutionRegistrationPage } from './pages/InstitutionRegistrationPage';
import { InstitutionPortal } from './pages/InstitutionPortal';
import { StudentRegistrationPage } from './pages/StudentRegistrationPage';
import { StudentPortal } from './pages/StudentPortal';
import { RecruiterRegistrationPage } from './pages/RecruiterRegistrationPage';
import { RecruiterPortal } from './pages/RecruiterPortal';
import { JobUploadPage } from './pages/JobUploadPage';
import { api } from './services/api';

export const App: React.FC = () => {
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
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {/* Universal Top Header with Multi-Tenant Navigation */}
        <Navbar dbType={dbType} />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* 1. Global Landing & Overview */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Institution Registration */}
            <Route path="/register" element={<InstitutionRegistrationPage />} />
            <Route path="/institution/register" element={<InstitutionRegistrationPage />} />
            <Route path="/institution-registration" element={<InstitutionRegistrationPage />} />

            {/* 3. Job Posting */}
            <Route path="/upload-job" element={<JobUploadPage />} />

            {/* 4. Student Registration under Institution */}
            <Route path="/:institutionId/student-registration" element={<StudentRegistrationPage />} />
            <Route path="/:institutionId/student/register" element={<StudentRegistrationPage />} />

            {/* 5. Student Profile under Institution */}
            <Route path="/:institutionId/student/:studentId" element={<StudentPortal />} />
            <Route path="/:institutionId/student" element={<StudentPortal />} />

            {/* 6. Recruiter Registration under Institution */}
            <Route path="/:institutionId/recruiter-registration" element={<RecruiterRegistrationPage />} />
            <Route path="/:institutionId/recruiter/register" element={<RecruiterRegistrationPage />} />

            {/* 7. Recruiter Portal under Institution */}
            <Route path="/:institutionId/recruiter/:recruiterId" element={<RecruiterPortal />} />
            <Route path="/:institutionId/recruiter" element={<RecruiterPortal />} />

            {/* 8. Institution Dashboard (<domain>/<registered college username>) */}
            <Route path="/:institutionId" element={<InstitutionPortal />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Minimal Studio Footer */}
        <footer className="border-t border-white/[0.06] bg-[#090a0f] py-6 text-xs text-slate-400 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-display font-semibold text-white">CampusLink</span>
              <span className="text-slate-600">//</span>
              <span className="text-slate-400">Deterministic University Placement Intelligence Monolith</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="capitalize">{dbType} Storage Engine</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>FastAPI Monolith</span>
              <span className="text-slate-600">•</span>
              <span>Multi-Tenant Architecture</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
