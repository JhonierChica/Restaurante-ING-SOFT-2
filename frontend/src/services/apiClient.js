const API_BASE_URL = 'http://localhost:8080/api';

export async function apiGet(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error('API Error');
  return response.json();
}