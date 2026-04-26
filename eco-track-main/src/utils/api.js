import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Activities
export const activityAPI = {
  sync: (data) => api.post('/activities/sync', data),
  claimBadge: (badgeId) => api.post('/activities/badges', { badgeId }),
};

// Tickets
export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getMine: () => api.get('/tickets/mine'),
  create: (formData) => api.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  updateWithProof: (id, formData) => api.put(`/tickets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verify: (id, isVerified) => api.put(`/tickets/verify/${id}`, { isVerifiedByUser: isVerified }),
  adminVerify: (id, isVerified) => api.put(`/tickets/admin-verify/${id}`, { isVerifiedByAdmin: isVerified }),
};

// Tasks
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  create: (formData) => api.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Leaderboard
export const leaderboardAPI = {
  getAll: () => api.get('/leaderboard'),
  byDepartment: () => api.get('/leaderboard/department'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createAdmin: (data) => api.post('/admin/create', data),
  resetPassword: (id, newPassword) => api.put(`/admin/reset-password/${id}`, { newPassword }),
};

export default api;
