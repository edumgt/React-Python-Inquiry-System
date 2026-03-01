const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const parseResponse = async (response) => {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  let message = 'Request failed';
  try {
    const error = await response.json();
    message = error.detail || error.message || message;
  } catch {
    message = `${response.status} ${response.statusText}`;
  }
  throw new Error(message);
};

export async function apiRequest(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}
