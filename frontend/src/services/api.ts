import {
  JobRequirements,
  JobMatchResult,
  StudentProfile,
  StudentReadinessResponse,
  SkillGapResponse,
  InstitutionStats,
  ApplicationRecord,
  Institution,
  InstitutionCreateData,
  Recruiter,
  RecruiterCreateData,
  RecruiterDetailResponse
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // System Health
  getHealth: () => fetchJson<{ status: string; database: string; version: string }>('/health'),

  // Institutions
  getInstitutions: () => fetchJson<Institution[]>('/institutions'),
  getInstitution: (identifier: string) => fetchJson<Institution>(`/institutions/${identifier}`),
  createInstitution: (data: InstitutionCreateData) =>
    fetchJson<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getScopedInstitutionStats: (identifier: string) =>
    fetchJson<InstitutionStats>(`/institutions/${identifier}/stats`),
  getInstitutionStudents: (identifier: string, branch?: string, minCgpa?: number) => {
    const q = new URLSearchParams();
    if (branch && branch !== 'all') q.set('branch', branch);
    if (minCgpa !== undefined) q.set('min_cgpa', minCgpa.toString());
    const query = q.toString() ? `?${q.toString()}` : '';
    return fetchJson<StudentProfile[]>(`/institutions/${identifier}/students${query}`);
  },
  registerStudent: (identifier: string, student: StudentProfile) =>
    fetchJson<StudentProfile>(`/institutions/${identifier}/students`, {
      method: 'POST',
      body: JSON.stringify(student)
    }),
  getInstitutionRecruiters: (identifier: string) =>
    fetchJson<Recruiter[]>(`/institutions/${identifier}/recruiters`),
  registerRecruiter: (identifier: string, data: RecruiterCreateData) =>
    fetchJson<Recruiter>(`/institutions/${identifier}/recruiters`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getRecruiterDetails: (identifier: string, recruiterId: string) =>
    fetchJson<RecruiterDetailResponse>(`/institutions/${identifier}/recruiters/${recruiterId}`),
  getInstitutionJobs: (identifier: string) =>
    fetchJson<JobRequirements[]>(`/institutions/${identifier}/jobs`),

  // Jobs
  getJobs: () => fetchJson<JobRequirements[]>('/jobs'),
  getJob: (id: string) => fetchJson<JobRequirements>(`/jobs/${id}`),
  createJob: (job: JobRequirements) =>
    fetchJson<JobRequirements>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job)
    }),

  // Candidate Matching
  getJobMatches: (jobId: string, includeIneligible = true, limit = 50, institutionId?: string) => {
    let url = `/jobs/${jobId}/matches?include_ineligible=${includeIneligible}&limit=${limit}`;
    if (institutionId) url += `&institution_id=${encodeURIComponent(institutionId)}`;
    return fetchJson<JobMatchResult>(url);
  },

  // Students
  getStudents: (branch?: string) =>
    fetchJson<StudentProfile[]>(`/students${branch ? `?branch=${branch}` : ''}`),
  getStudent: (id: string) => fetchJson<StudentProfile>(`/students/${id}`),

  // Diagnostics & Readiness
  getStudentReadiness: (studentId: string) =>
    fetchJson<StudentReadinessResponse>(`/students/${studentId}/readiness`),
  getStudentSkillGaps: (studentId: string, jobId: string) =>
    fetchJson<SkillGapResponse>(`/students/${studentId}/skill-gaps/${jobId}`),

  // Legacy Institution Analytics
  getInstitutionStats: () => fetchJson<InstitutionStats>('/institution/stats'),

  // AI Resume Parsing
  parseResume: (raw_text: string, save = false) =>
    fetchJson<StudentProfile>(`/students/parse-resume?save=${save}`, {
      method: 'POST',
      body: JSON.stringify({ raw_text })
    }),

  // Applications & Shortlists
  getApplications: (params?: { job_id?: string; student_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.job_id) q.set('job_id', params.job_id);
    if (params?.student_id) q.set('student_id', params.student_id);
    if (params?.status) q.set('status', params.status);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return fetchJson<ApplicationRecord[]>(`/applications${queryString}`);
  },

  createApplication: (data: { job_id: string; student_id: string; status?: string; match_score?: number; notes?: string }) =>
    fetchJson<ApplicationRecord>('/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteApplication: (id: number) =>
    fetchJson<void>(`/applications/${id}`, {
      method: 'DELETE'
    })
};

