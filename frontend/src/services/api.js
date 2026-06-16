const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getHeaders(),
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }

  return data;
}

export function registerUser(username, email, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function loginUser(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchProfile() {
  return request('/profile');
}

export function fetchJobs(page = 1, perPage = 12) {
  return request(`/get_jobs?page=${page}&per_page=${perPage}`);
}

export function searchJobs(filters, page = 1, perPage = 12) {
  return request(`/search_jobs?page=${page}&per_page=${perPage}`, {
    method: 'POST',
    body: JSON.stringify(filters),
  });
}

export function fetchJob(jobId) {
  return request(`/jobs/${jobId}`);
}

export function saveJob(jobId) {
  return request('/save_job', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId }),
  });
}

export function fetchSavedJobs() {
  return request('/saved_jobs');
}

export function unsaveJob(jobId) {
  return request(`/saved_jobs/${jobId}`, { method: 'DELETE' });
}

export function fetchAlerts() {
  return request('/alert_preferences');
}

export function createAlert(alertData) {
  return request('/alert_preferences', {
    method: 'POST',
    body: JSON.stringify(alertData),
  });
}

export function deleteAlert(alertId) {
  return request(`/alert_preferences/${alertId}`, { method: 'DELETE' });
}

export function fetchSources() {
  return request('/job_sources');
}

export function fetchLocations() {
  return request('/locations');
}
