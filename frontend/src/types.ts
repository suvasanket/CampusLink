export interface SkillItem {
  name: string;
  level: number;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year?: number;
}

export interface AssessmentData {
  aptitude: number;
  technical: number;
  communication: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  branch: string;
  graduation_year?: number;
  cgpa: number;
  backlogs: number;
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications?: CertificationItem[];
  assessment: AssessmentData;
  readiness_score?: number;
  readiness_tier?: string;
  institution_id?: string;
}

export interface JobRequirements {
  id: string;
  company: string;
  title: string;
  description?: string;
  minimum_cgpa: number;
  eligible_branches: string[];
  max_backlogs: number;
  graduation_years?: number[];
  required_skills: string[];
  preferred_skills?: string[];
  responsibilities?: string[];
  experience_level?: string;
  institution_id?: string;
  recruiter_id?: string;
}

export interface ScoreBreakdown {
  skills: number;
  projects: number;
  academics: number;
  assessment: number;
  certifications: number;
  communication: number;
}

export interface CandidateMatchItem {
  student_id: string;
  student_name: string;
  branch?: string;
  cgpa?: number;
  rank: number;
  eligible: boolean;
  match_score: number;
  category: "Highly Suitable" | "Suitable" | "Potential Fit" | "Not Recommended" | "Ineligible";
  breakdown: ScoreBreakdown;
  strengths: string[];
  skill_gaps: string[];
  preferred_skill_gaps: string[];
  explanation: string;
  ineligibility_reasons?: string[];
}

export interface JobMatchResult {
  job_id: string;
  job_title?: string;
  company?: string;
  total_evaluated: number;
  total_eligible: number;
  matches: CandidateMatchItem[];
}

export interface ReadinessFactorScores {
  technical_skills: number;
  project_depth: number;
  academics: number;
  assessments: number;
  communication: number;
}

export interface StudentReadinessResponse {
  student_id: string;
  student_name: string;
  readiness_score: number;
  tier: "Highly Employable" | "Ready" | "Developing" | "Not Ready";
  factor_scores: ReadinessFactorScores;
  recommendations: string[];
}

export interface SkillGapResponse {
  student_id: string;
  job_id: string;
  matched_required_skills: string[];
  missing_required_skills: string[];
  matched_preferred_skills: string[];
  missing_preferred_skills: string[];
  coverage_percentage: number;
  actionable_next_steps: string[];
}

export interface InstitutionStats {
  institution_id?: string;
  institution_username?: string;
  institution_name?: string;
  total_students: number;
  total_jobs: number;
  total_shortlists?: number;
  total_interviews?: number;
  total_offers?: number;
  readiness_distribution: {
    "Highly Employable": number;
    "Ready": number;
    "Developing": number;
    "Not Ready": number;
  };
  branch_summary: Record<string, { total: number; avg_cgpa: number }>;
}

export interface ApplicationRecord {
  id: number;
  job_id: string;
  student_id: string;
  student_name?: string;
  job_title?: string;
  company?: string;
  status: "Shortlisted" | "Interview" | "Offered" | "Rejected";
  match_score?: number;
  notes?: string;
  created_at?: string;
}

export interface Institution {
  id: string;
  username: string;
  name: string;
  code?: string;
  location?: string;
  contact_email?: string;
  admin_name?: string;
  website?: string;
  is_verified?: boolean;
  created_at?: string;
  total_students?: number;
  total_jobs?: number;
}

export interface InstitutionCreateData {
  name: string;
  username: string;
  password?: string;
  code?: string;
  location?: string;
  contact_email?: string;
  admin_name?: string;
  website?: string;
}

export interface InstitutionLoginResponse {
  institution: Institution;
  token: string;
  message: string;
}

export interface StudentRegisterData extends StudentProfile {
  password: string;
}

export interface StudentLoginResponse {
  student: StudentProfile;
  token: string;
  message: string;
}

export interface LoggedInStudent {
  id: string;
  name: string;
  email?: string;
  institution_id?: string;
}

export interface Recruiter {
  id: string;
  institution_id: string;
  name: string;
  company_name: string;
  email: string;
  designation?: string;
  created_at?: string;
  active_jobs_count?: number;
}

export interface RecruiterCreateData {
  name: string;
  company_name: string;
  email: string;
  designation?: string;
  initial_job_title?: string;
  initial_job_min_cgpa?: number;
  initial_job_branches?: string[];
  initial_job_skills?: string[];
}

export interface RecruiterDetailResponse {
  recruiter: Recruiter;
  jobs: JobRequirements[];
}

