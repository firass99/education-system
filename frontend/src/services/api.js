import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Public pages pass { public: true } so they always see what a guest sees (e.g. no unpublished courses for admins)
  if (token && !config.public) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Extract a human-readable message (and first validation error) from an axios error. */
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  return data?.message || (error?.request && !error.response ? 'Cannot reach the server.' : fallback);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Callers can opt out of the global toast with { silent: true } in the request config
    const silent = error.config?.silent;

    if (!error.response) {
      if (!silent) toast.error('Cannot reach the server. Check your connection.', { id: 'network' });
    } else if (status === 401) {
      const hadToken = !!localStorage.getItem('token');
      const isAuthCall = error.config?.url?.startsWith('/auth/login');
      if (hadToken && !isAuthCall) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Your session has expired. Please log in again.', { id: 'session' });
        if (window.location.pathname !== '/login') window.location.assign('/login');
      }
    } else if (!silent) {
      if (status === 403) toast.error(getErrorMessage(error, 'You do not have permission to do that.'));
      else if (status === 404) toast.error(getErrorMessage(error, 'Resource not found.'));
      else if (status === 422) toast.error(getErrorMessage(error, 'Please check the form and try again.'));
      else if (status >= 500) toast.error('Server error. Please try again later.');
      else toast.error(getErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

export default api;
