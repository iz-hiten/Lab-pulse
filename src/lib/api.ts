// API wrapper - uses mock data for frontend-only mode
import { mockAPI } from './mockData';

const USE_MOCK_DATA = true; // Set to true for frontend-only mode

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Helper to make real API calls (when USE_MOCK_DATA is false)
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// API functions that switch between mock and real data
export const api = {
  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      return mockAPI.login(email, password);
    }
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (token: string) => {
    if (USE_MOCK_DATA) {
      return mockAPI.getMe(token);
    }
    return fetchAPI('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getSchools: async () => {
    if (USE_MOCK_DATA) {
      return mockAPI.getSchools();
    }
    return fetchAPI('/schools');
  },

  getSchoolDetail: async (schoolId: string) => {
    if (USE_MOCK_DATA) {
      return mockAPI.getSchoolDetail(schoolId);
    }
    return fetchAPI(`/schools/${schoolId}`);
  },

  getEntries: async (schoolId?: string, limit?: number) => {
    if (USE_MOCK_DATA) {
      return mockAPI.getEntries(schoolId, limit);
    }
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId);
    if (limit) params.append('limit', limit.toString());
    return fetchAPI(`/entries?${params}`);
  },

  createEntry: async (token: string, entryData: any) => {
    if (USE_MOCK_DATA) {
      return mockAPI.createEntry(entryData);
    }
    return fetchAPI('/entries', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(entryData),
    });
  },

  getUsers: async (token: string) => {
    if (USE_MOCK_DATA) {
      return mockAPI.getUsers();
    }
    return fetchAPI('/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createSchool: async (token: string, schoolData: any) => {
    if (USE_MOCK_DATA) {
      return mockAPI.createSchool(schoolData);
    }
    return fetchAPI('/schools', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(schoolData),
    });
  },

  createUser: async (token: string, userData: any) => {
    if (USE_MOCK_DATA) {
      throw new Error('User creation not available in mock mode');
    }
    return fetchAPI('/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },

  resetPassword: async (token: string, userId: string, newPassword: string) => {
    if (USE_MOCK_DATA) {
      throw new Error('Password reset not available in mock mode');
    }
    return fetchAPI('/users/reset-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, newPassword }),
    });
  },

  getWeeklyReport: async () => {
    if (USE_MOCK_DATA) {
      // Generate mock report
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        reportText: 'Mock weekly report generated from frontend data...',
        generatedAt: new Date().toISOString(),
      };
    }
    return fetchAPI('/reports/weekly');
  },
};
