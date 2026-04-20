import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Certification Service
export const certificationService = {
  getAllCertifications: () => apiClient.get('/certifications'),
  getCertificationDetail: (certId) => apiClient.get(`/certifications/${certId}`),
};

// Exam Service
export const examService = {
  startExam: (data) => apiClient.post('/exams/start', data),
  getExamAttempt: (examId) => apiClient.get(`/exams/${examId}`),
  getCurrentQuestion: (examId) => apiClient.get(`/exams/${examId}/question`),
  submitAnswer: (examId, data) => apiClient.post(`/exams/${examId}/answer`, data),
  nextQuestion: (examId) => apiClient.post(`/exams/${examId}/next`),
  previousQuestion: (examId) => apiClient.post(`/exams/${examId}/previous`),
  markComplete: (examId) => apiClient.post(`/exams/${examId}/mark-complete`),
  submitExam: (examId, data) => apiClient.post(`/exams/${examId}/submit`, data),
  logTabSwitch: (examId) => apiClient.post(`/exams/${examId}/log-tab-switch`),
  logCopyPaste: (examId) => apiClient.post(`/exams/${examId}/log-copy-paste`),
};

// Dashboard Service
export const dashboardService = {
  getDashboard: () => apiClient.get('/dashboard'),
};

// Payment Service
export const paymentService = {
  initiatePayment: (data) => apiClient.post('/payments/initiate', data),
  verifyPayment: (data) => apiClient.post('/payments/verify', data),
};

// Skill Wallet Service
export const skillWalletService = {
  getWalletDetails: () => apiClient.get('/skill-wallet/details'),
  getPublicWallet: (walletUrl) => apiClient.get(`/skill-wallet/${walletUrl}`),
  togglePublic: () => apiClient.post('/skill-wallet/toggle-public'),
};

// Admin Service
export const adminService = {
  seedData: () => apiClient.post('/admin/seed-data'),
};

export default apiClient;
