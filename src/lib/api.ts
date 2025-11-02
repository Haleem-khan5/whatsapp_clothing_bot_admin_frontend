import axios from 'axios';

// Prefer env-provided server URL. With Vite, expose it as VITE_SERVER_URL in .env
// Examples:
// VITE_SERVER_URL=http://localhost:8000
// VITE_SERVER_URL=https://api.example.com/api
// Read from Vite env (must be prefixed with VITE_), allow window override for non-Vite embedders
const rawEnvBase: string | undefined =
  ((typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SERVER_URL) as string | undefined) ||
  ((typeof window !== 'undefined' && (window as any).__API_BASE__) as string | undefined) ||
  undefined;
// Sanitize and normalize base URL:
// // - use VITE_SERVER_URL when provided, else default to '/api' (Vite dev proxy)
let envBase = (rawEnvBase || '/api') as string;
envBase = "https://clothing-bot-uw4d.onrender.com";

// envBase = "http://localhost:8000";
if (envBase.startsWith('@')) envBase = envBase.slice(1);
envBase = String(envBase).trim();
const sanitized = (envBase || '/api').replace(/\/+$/, '');
const isAbsolute = /^https?:\/\//i.test(sanitized);

// Debug: show what Vite injected and what we resolved to
try {
  // eslint-disable-next-line no-console
  console.info('[API] VITE_SERVER_URL (raw):', rawEnvBase);
  // eslint-disable-next-line no-console
  console.info('[API] Resolved API base:', isAbsolute ? sanitized : `(relative) ${sanitized}`);
} catch {}

// If absolute, let axios handle it. If relative (e.g. '/api'),
// we will prefix requests in an interceptor so callers can use '/auth/...'.
export const api = axios.create({
  baseURL: isAbsolute ? sanitized : '',
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Prefix relative API calls with '/api' in dev/proxy mode
  if (!isAbsolute) {
    const url = config.url || '';
    if (!/^https?:\/\//i.test(url)) {
      const path = url.startsWith('/') ? url : `/${url}`;
      config.url = `${sanitized}${path}`; // e.g. '/api' + '/auth/login'
    }
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
