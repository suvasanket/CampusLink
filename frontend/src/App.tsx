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
import { StudentLoginPage } from './pages/StudentLoginPage';
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
      <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 selection:bg-emerald-500 selection:text-black">
        {/* Universal Top Header Navigation */}
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

            {/* 4. Student Registration & Login under Institution */}
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route path="/:institutionId/student-login" element={<StudentLoginPage />} />
            <Route path="/:institutionId/student/login" element={<StudentLoginPage />} />
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
      </div>
    </BrowserRouter>
  );
};

export default App;
