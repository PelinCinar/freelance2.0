// API Base URL Configuration
// Vite'da environment variable'lar import.meta.env ile erişilir
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,

  // Project endpoints
  PROJECTS: `${API_BASE_URL}/api/projects`,
  MY_PROJECTS: `${API_BASE_URL}/api/projects/my-projects`,
  COMPLETED_PROJECTS: `${API_BASE_URL}/api/projects/completed`,
  PROJECT_BY_ID: (id) => `${API_BASE_URL}/api/projects/${id}`,

  // Bid endpoints
  BIDS: `${API_BASE_URL}/api/bids`,
  MY_BIDS: `${API_BASE_URL}/api/bids/my-bids`,
  PROJECT_BIDS: (projectId) => `${API_BASE_URL}/api/bids/project/${projectId}`,
  BID_BY_ID: (id) => `${API_BASE_URL}/api/bids/${id}`,
  OPEN_PROJECTS_WITH_BIDS: `${API_BASE_URL}/api/bids/open-projects-with-bids`,
  ACCEPT_BID: (bidId) => `${API_BASE_URL}/api/bids/${bidId}/accept`,
  REJECT_BID: (bidId) => `${API_BASE_URL}/api/bids/${bidId}/reject`,

  // Review endpoints
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  MY_REVIEWS: `${API_BASE_URL}/api/reviews/my-reviews`,

  // Admin endpoints
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,

  // Upload endpoints
  UPLOAD_IMAGE: (fileName) => `${API_BASE_URL}/api/upload/image/${fileName}`,

  // Notification endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
};

// Socket URL
export const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';

// Default fetch options
export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Helper functions
export const apiRequest = async (url, options = {}) => {
  const config = {
    ...DEFAULT_FETCH_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_FETCH_OPTIONS.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// GET request helper
export const apiGet = async (url) => {
  return apiRequest(url, { method: 'GET' });
};

// POST request helper
export const apiPost = async (url, data) => {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT request helper
export const apiPut = async (url, data) => {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE request helper
export const apiDelete = async (url) => {
  return apiRequest(url, { method: 'DELETE' });
};

export default API_BASE_URL;
