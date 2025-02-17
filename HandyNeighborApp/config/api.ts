// API Base URL
// export const API_BASE_URL = 'http://localhost:8000/api';
export const API_BASE_URL = 'http://localhost:3000/api';


// Auth endpoints
export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register/`,
  login: `${API_BASE_URL}/auth/login/`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  list: `${API_BASE_URL}/tasks/`,
  create: `${API_BASE_URL}/tasks/create/`,
  detail: (id: string) => `${API_BASE_URL}/tasks/${id}/`,
};

// User endpoints
export const USER_ENDPOINTS = {
  profile: `${API_BASE_URL}/users/profile/`,
  update: `${API_BASE_URL}/users/update/`,
}; 