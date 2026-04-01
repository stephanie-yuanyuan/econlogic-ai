import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Wrapper around fetch that automatically attaches the Supabase JWT
 * and handles JSON parsing / error responses.
 *
 * @param {string} path  - API path, e.g. '/api/units'
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
export async function apiFetch(path, options = {}) {
  const session = useAuthStore.getState().session;
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.error || `API Error: ${response.status}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
