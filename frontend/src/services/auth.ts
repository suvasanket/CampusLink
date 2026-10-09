import { Institution, LoggedInStudent } from '../types';

const INST_STORAGE_KEY = 'campuslink_logged_in_institution';
const INST_TOKEN_KEY = 'campuslink_institution_token';
const STUDENT_STORAGE_KEY = 'campuslink_logged_in_student';
const STUDENT_TOKEN_KEY = 'campuslink_student_token';

export const authService = {
  // --- Institution Administrator Session ---
  getLoggedInInstitution: (): Institution | null => {
    try {
      const data = localStorage.getItem(INST_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getInstitutionToken: (): string | null => {
    try {
      return localStorage.getItem(INST_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  isInstitutionAdmin: (identifier?: string): boolean => {
    try {
      const current = authService.getLoggedInInstitution();
      if (!current) return false;
      if (!identifier) return true;
      const cleanIdent = identifier.trim().toLowerCase();
      const currentId = (current.id || '').toLowerCase();
      const currentUsername = (current.username || '').toLowerCase();
      return cleanIdent === currentId || cleanIdent === currentUsername;
    } catch {
      return false;
    }
  },

  setLoggedInInstitution: (institution: Institution, token?: string): void => {
    try {
      localStorage.setItem(INST_STORAGE_KEY, JSON.stringify(institution));
      if (token) {
        localStorage.setItem(INST_TOKEN_KEY, token);
      }
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to store institution auth in localStorage:', err);
    }
  },

  logoutInstitution: (): void => {
    try {
      localStorage.removeItem(INST_STORAGE_KEY);
      localStorage.removeItem(INST_TOKEN_KEY);
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to clear institution auth from localStorage:', err);
    }
  },

  // Alias for backward compatibility
  logout: (): void => {
    authService.logoutInstitution();
  },

  // --- Student Candidate Session ---
  getLoggedInStudent: (): LoggedInStudent | null => {
    try {
      const data = localStorage.getItem(STUDENT_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getStudentToken: (): string | null => {
    try {
      return localStorage.getItem(STUDENT_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  isStudent: (studentId?: string, institutionIdentifier?: string): boolean => {
    try {
      const current = authService.getLoggedInStudent();
      if (!current) return false;
      if (studentId && current.id.toLowerCase() !== studentId.trim().toLowerCase()) {
        return false;
      }
      if (institutionIdentifier && current.institution_id) {
        const cleanInst = institutionIdentifier.trim().toLowerCase();
        const currentInst = current.institution_id.toLowerCase();
        if (cleanInst !== currentInst && !cleanInst.includes(currentInst)) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  setLoggedInStudent: (student: LoggedInStudent, token?: string): void => {
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
      if (token) {
        localStorage.setItem(STUDENT_TOKEN_KEY, token);
      }
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to store student auth in localStorage:', err);
    }
  },

  logoutStudent: (): void => {
    try {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
      localStorage.removeItem(STUDENT_TOKEN_KEY);
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to clear student auth from localStorage:', err);
    }
  },

  logoutAll: (): void => {
    authService.logoutInstitution();
    authService.logoutStudent();
  }
};
