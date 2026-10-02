// Pure NXTGEN Studio CMS API Client
// Handles authentication, CMS data operations, and media uploads

const API_BASE = '/api';
const TOKEN_STORAGE_KEY = 'nxtgen_admin_token';
const USER_STORAGE_KEY = 'nxtgen_admin_user';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface StatsData {
  inquiries: { total: number; new: number };
  services: number;
  servicesActive: number;
  reviews: number;
  reviewsActive: number;
  projects: number;
  team: number;
  ideas: number;
  recentInquiries: Inquiry[];
  recentProjects: ProjectItem[];
  recentReviews: ReviewItem[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  ip_address?: string;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  tag: string;
  title: string;
  description: string;
  image_url: string;
  is_active: number | boolean;
  sort_order: number;
  created_at?: string;
}

export interface ReviewItem {
  id: number;
  client_name: string;
  role: string;
  quote: string;
  project: string;
  rating: number;
  review_date: string;
  avatar_url?: string;
  is_active: number | boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string;
  status: string;
  client?: string;
  demo_url?: string;
  image_url?: string;
  sort_order: number;
  created_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  initials: string;
  image_url?: string;
  social_links?: string;
  sort_order: number;
  is_active: number | boolean;
  created_at?: string;
}

export interface IdeaItem {
  id: number;
  title: string;
  sort_order: number;
  is_active: number | boolean;
  created_at?: string;
}

export interface PublicContentBundle {
  settings: Record<string, string>;
  services: ServiceItem[];
  reviews: ReviewItem[];
  projects: ProjectItem[];
  team: TeamMember[];
  ideas: string[];
}

// ----------------------------------------------------------------------
// Auth Storage Helpers
// ----------------------------------------------------------------------

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AdminUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Auth-Token'] = token;
  }
  return headers;
}

// ----------------------------------------------------------------------
// Authentication
// ----------------------------------------------------------------------

export async function login(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network connection failed' };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Ignore network error on logout
  } finally {
    clearAuthToken();
  }
}

export async function fetchCurrentUser(): Promise<AdminUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me?_t=${Date.now()}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      clearAuthToken();
      return null;
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      setStoredUser(data.user);
      return data.user;
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

// ----------------------------------------------------------------------
// Media Upload
// ----------------------------------------------------------------------

export async function uploadMedia(file: File): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  if (token) {
    formData.append('token', token); // Fallback in case Apache/FastCGI strips Authorization header
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Auth-Token'] = token;
  }

  try {
    const res = await fetch(`${API_BASE}/upload?_t=${Date.now()}`, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      if (res.status === 413) {
        return { success: false, error: 'File size exceeds server upload limit (413 Payload Too Large).' };
      }
      if (res.status === 401) {
        return { success: false, error: 'Session expired or unauthorized. Please re-login.' };
      }
      return { success: false, error: `Upload server error (${res.status}): ${text.slice(0, 100) || res.statusText}` };
    }

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || `Upload failed (${res.status})` };
    }
    return { success: true, url: data.url, filename: data.filename };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload network request failed' };
  }
}

// ----------------------------------------------------------------------
// Dashboard Stats & Activity
// ----------------------------------------------------------------------

export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(`${API_BASE}/stats?_t=${Date.now()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  return res.json();
}

export async function fetchActivity(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_BASE}/activity?_t=${Date.now()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

// ----------------------------------------------------------------------
// Public Website Content
// ----------------------------------------------------------------------

export async function fetchPublicContent(): Promise<PublicContentBundle> {
  const res = await fetch(`${API_BASE}/content?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Inquiries CMS
// ----------------------------------------------------------------------

export async function fetchInquiries(): Promise<Inquiry[]> {
  const res = await fetch(`${API_BASE}/inquiries?_t=${Date.now()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function submitInquiry(data: { name: string; email: string; message: string }): Promise<{ success: boolean; id?: number; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInquiryStatus(id: number, status: 'new' | 'read' | 'replied'): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteInquiry(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Services CMS
// ----------------------------------------------------------------------

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch(`${API_BASE}/services?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
  const res = await fetch(`${API_BASE}/services`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateService(id: number, data: Partial<ServiceItem>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/services/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteService(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/services/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Projects CMS
// ----------------------------------------------------------------------

export async function fetchProjects(): Promise<ProjectItem[]> {
  const res = await fetch(`${API_BASE}/projects?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function createProject(data: Partial<ProjectItem>): Promise<ProjectItem> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProject(id: number, data: Partial<ProjectItem>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProject(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Client Reviews CMS
// ----------------------------------------------------------------------

export async function fetchReviews(): Promise<ReviewItem[]> {
  const res = await fetch(`${API_BASE}/reviews?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function createReview(data: Partial<ReviewItem>): Promise<ReviewItem> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateReview(id: number, data: Partial<ReviewItem>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteReview(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Team Members CMS
// ----------------------------------------------------------------------

export async function fetchTeam(): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/team?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function createTeam(data: Partial<TeamMember>): Promise<TeamMember> {
  const res = await fetch(`${API_BASE}/team`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTeam(id: number, data: Partial<TeamMember>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/team/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTeam(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/team/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Marquee Ideas CMS
// ----------------------------------------------------------------------

export async function fetchIdeas(): Promise<IdeaItem[]> {
  const res = await fetch(`${API_BASE}/ideas?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  return res.json();
}

export async function createIdea(data: { title: string; sort_order?: number; is_active?: boolean | number }): Promise<IdeaItem> {
  const res = await fetch(`${API_BASE}/ideas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateIdea(id: number, data: Partial<IdeaItem>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/ideas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteIdea(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/ideas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ----------------------------------------------------------------------
// Global Website Settings CMS
// ----------------------------------------------------------------------

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/settings?_t=${Date.now()}`, {
    cache: 'no-store',
  });
  const rows = await res.json();
  const map: Record<string, string> = {};
  if (Array.isArray(rows)) {
    rows.forEach((r: any) => {
      map[r.id] = r.value;
    });
  }
  return map;
}

export async function updateSettings(updates: Record<string, string>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return res.json();
}
