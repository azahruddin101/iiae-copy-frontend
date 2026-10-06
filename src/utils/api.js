import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('innovbit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors like expired token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('innovbit_token');
      localStorage.removeItem('innovbit_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// We export using CommonJS or ESM? The vite environment is "type": "module" which uses ESM.
// Wait, the client is React ESM. So we should use ES modules exports!
export default api;
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('innovbit_token', token);
  } else {
    localStorage.removeItem('innovbit_token');
  }
};
