import { Institution } from '../types';

const AUTH_STORAGE_KEY = 'campuslink_logged_in_institution';

export const authService = {
  getLoggedInInstitution: (): Institution | null => {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLoggedInInstitution: (institution: Institution): void => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(institution));
      // Dispatch a storage event so all components/listeners re-render
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to store institution auth in localStorage:', err);
    }
  },

  logout: (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event('campuslink-auth-change'));
    } catch (err) {
      console.error('Failed to clear institution auth from localStorage:', err);
    }
  }
};
