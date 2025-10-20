import axios from 'axios';

// Prefer env-provided server URL. With Vite, expose it as VITE_SERVER_URL in .env
// Examples:
// VITE_SERVER_URL=http://localhost:8000
// VITE_SERVER_URL=https://api.example.com/api
const envBase = (import.meta as any)?.env?.VITE_SERVER_URL as string | undefined;
const baseURL = (envBase || '/api').replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to standardize response format
api.interceptors.response.use(
  (response) => {
    return {
      ...response,
      data: {
        ok: true,
        data: response.data.data || response.data,
        meta: response.data.meta || {},
      },
    };
  },
  (error) => {
    return Promise.reject(error);
  }
);
