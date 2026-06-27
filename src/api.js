const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(body) {
  return request('/auth/register', {
    method: 'POST',
    body,
  });
}

export function getMe() {
  return request('/auth/me');
}
export function getCollegeAdmin(collegeId) {
  return request(`/colleges/${collegeId}/admin`);
}
export function updateProfile(data) {
  return request('/auth/me', {
    method: 'PUT',
    body: data,
  });
}

export function getDashboard() {
  return request('/dashboard');
}

export function getNotices(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/notices${q ? `?${q}` : ''}`);
}

export function getEvents(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/events${q ? `?${q}` : ''}`);
}

export function getComplaints(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/complaints${q ? `?${q}` : ''}`);
}

export function createComplaint(body) {
  return request('/complaints', {
    method: 'POST',
    body,
  });
}

export function getLostFound(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/lostfound${q ? `?${q}` : ''}`);
}

export function reportLostFound(body) {
  return request('/lostfound', {
    method: 'POST',
    body,
  });
}
export function deleteLostFound(id) {
  return request(`/lostfound/${id}`, { method: 'DELETE' });
}

export function createNotice(body) {
  return request('/notices', { method: 'POST', body });
}
export function updateNotice(id, body) {
  return request(`/notices/${id}`, { method: 'PUT', body });
}
export function deleteNotice(id) {
  return request(`/notices/${id}`, { method: 'DELETE' });
}
export function createEvent(body) {
  return request('/events', { method: 'POST', body });
}
export function updateEvent(id, body) {
  return request(`/events/${id}`, { method: 'PUT', body });
}
export function deleteEvent(id) {
  return request(`/events/${id}`, { method: 'DELETE' });
}
export function updateComplaintStatus(id, status) {
  return request(`/complaints/${id}/status`, { method: 'PUT', body: { status } });
}
export function deleteComplaint(id) {
  return request(`/complaints/${id}`, { method: 'DELETE' });
}
export function uploadGalleryImage(formData) {
  const token = getToken();
  return fetch(`${BASE}/gallery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Upload failed'); return d; });
}

export function getGallery(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/gallery${q ? `?${q}` : ''}`);
}

export function deleteGalleryImage(id) {
  return request(`/gallery/${id}`, { method: 'DELETE' });
}

export function getStudyMaterials(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/study${q ? `?${q}` : ''}`);
}

export function uploadStudyMaterial(formData) {
  const token = getToken();
  return fetch(`${BASE}/study`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Upload failed'); return d; });
}

export function deleteStudyMaterial(id) {
  return request(`/study/${id}`, { method: 'DELETE' });
}

export function incrementDownload(id) {
  return request(`/study/${id}/download`, { method: 'PUT' });
}

export function getColleges() {
  return request('/colleges');
}

export function registerCollege(body) {
  return request('/colleges/register', {
    method: 'POST',
    body,
  });
}
