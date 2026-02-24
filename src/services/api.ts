const API_BASE = '/api';

// ─── Token helpers ───────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

// ─── Generic fetch wrapper ───────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    // If 401 on a non-login request, token expired → force logout
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      removeToken();
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(json.message || json.errors?.[0]?.msg || 'เกิดข้อผิดพลาด');
  }

  return json;
}

// ─── Response types ──────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface LoginData {
  token: string;
  user: {
    id: number;
    username: string;
    role: 'admin' | 'student' | 'advisor';
  };
}

// ─── Auth API ────────────────────────────────────────────────────
export const authApi = {
  login(username: string, password: string) {
    return request<ApiResponse<LoginData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  getProfile() {
    return request<ApiResponse<Record<string, unknown>>>('/auth/profile');
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request<ApiResponse<null>>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ─── Students API ────────────────────────────────────────────────
export const studentsApi = {
  getAll(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Record<string, unknown>>>(`/students${qs}`);
  },

  getById(id: string) {
    return request<ApiResponse<Record<string, unknown>>>(`/students/${id}`);
  },

  create(data: Record<string, unknown>) {
    return request<ApiResponse<{ id: number }>>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return request<ApiResponse<null>>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<ApiResponse<null>>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  batchUpdateStatus(studentIds: string[], status: string) {
    return request<ApiResponse<{ affectedRows: number }>>('/students/status/batch', {
      method: 'PUT',
      body: JSON.stringify({ studentIds: studentIds.map(Number), status }),
    });
  },

  graduate(studentIds: string[]) {
    return request<ApiResponse<{ graduatedCount: number }>>('/students/graduate', {
      method: 'POST',
      body: JSON.stringify({ studentIds: studentIds.map(Number) }),
    });
  },
};

// ─── Import API ──────────────────────────────────────────────────
export const importApi = {
  async importStudents(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/import/students`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    }
    return json;
  },
};

// ─── Alumni API ──────────────────────────────────────────────────
export const alumniApi = {
  getAll(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Record<string, unknown>>>(`/alumni${qs}`);
  },

  getById(id: string) {
    return request<ApiResponse<Record<string, unknown>>>(`/alumni/${id}`);
  },

  create(data: Record<string, unknown>) {
    return request<ApiResponse<{ id: number }>>('/alumni', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return request<ApiResponse<null>>(`/alumni/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<ApiResponse<null>>(`/alumni/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Advisors API ────────────────────────────────────────────────
export const advisorsApi = {
  getAll(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Record<string, unknown>>>(`/advisors${qs}`);
  },

  getById(id: string) {
    return request<ApiResponse<Record<string, unknown>>>(`/advisors/${id}`);
  },

  create(data: Record<string, unknown>) {
    return request<ApiResponse<{ id: number }>>('/advisors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return request<ApiResponse<null>>(`/advisors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<ApiResponse<null>>(`/advisors/${id}`, {
      method: 'DELETE',
    });
  },
};

// ─── Projects API ────────────────────────────────────────────────
export const projectsApi = {
  getAll(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Record<string, unknown>>>(`/projects${qs}`);
  },

  getById(id: string) {
    return request<ApiResponse<Record<string, unknown>>>(`/projects/${id}`);
  },

  create(data: Record<string, unknown>) {
    return request<ApiResponse<{ id: number }>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return request<ApiResponse<null>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addComment(projectId: string, data: { author_name: string; author_role: string; message: string }) {
    return request<ApiResponse<{ id: number }>>(`/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<ApiResponse<null>>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
