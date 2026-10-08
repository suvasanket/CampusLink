import {
  JobRequirements,
  JobMatchResult,
  StudentProfile,
  StudentReadinessResponse,
  SkillGapResponse,
  InstitutionStats,
  ApplicationRecord
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

  // Jobs
  getJobs: () => fetchJson<JobRequirements[]>('/jobs'),
  getJob: (id: string) => fetchJson<JobRequirements>(`/jobs/${id}`),
  createJob: (job: JobRequirements) =>
    fetchJson<JobRequirements>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job)
    }),

  // Candidate Matching
  getJobMatches: (jobId: string, includeIneligible = true, limit = 50) =>
    fetchJson<JobMatchResult>(`/jobs/${jobId}/matches?include_ineligible=${includeIneligible}&limit=${limit}`),

  // Students
  getStudents: (branch?: string) =>
    fetchJson<StudentProfile[]>(`/students${branch ? `?branch=${branch}` : ''}`),
  getStudent: (id: string) => fetchJson<StudentProfile>(`/students/${id}`),

  // Diagnostics & Readiness
  getStudentReadiness: (studentId: string) =>
    fetchJson<StudentReadinessResponse>(`/students/${studentId}/readiness`),
  getStudentSkillGaps: (studentId: string, jobId: string) =>
    fetchJson<SkillGapResponse>(`/students/${studentId}/skill-gaps/${jobId}`),

  // Institution Analytics
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

