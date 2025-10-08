// API Configuration
export const API_BASE_URL = 'https://harbor-reflections-backend.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
    stats: `${API_BASE_URL}/api/auth/stats`,
  },
  checkins: {
    create: `${API_BASE_URL}/api/checkins`,
    history: `${API_BASE_URL}/api/checkins/history`,
  },
};