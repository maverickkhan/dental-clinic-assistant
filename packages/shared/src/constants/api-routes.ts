export const API_BASE = '/api/v1';

export const API_ROUTES = {
  // Health
  HEALTH: `${API_BASE}/health`,

  // Auth
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    ME: `${API_BASE}/auth/me`,
  },

  // Patients
  PATIENTS: {
    BASE: `${API_BASE}/patients`,
    BY_ID: (id: string) => `${API_BASE}/patients/${id}`,
  },

  // Chat
  CHAT: {
    SEND: `${API_BASE}/chat`,
    HISTORY: (patientId: string) => `${API_BASE}/chat/history/${patientId}`,
  },
} as const;
