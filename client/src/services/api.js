const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('taskflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Projects
  async getProjects(status) {
    const url = status && status !== 'All' 
      ? `${API_BASE}/projects?status=${encodeURIComponent(status)}`
      : `${API_BASE}/projects`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
    return data.data || [];
  },

  async createProject(projectData) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create project');
    return data.data;
  },

  // Tasks
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.projectId && filters.projectId !== 'All') params.append('projectId', filters.projectId);

    const url = `${API_BASE}/tasks?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks');
    return data.data || [];
  },

  async createTask(taskData) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create task');
    return data.data;
  },

  async updateTaskStatus(taskId, status) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update task status');
    return data.data;
  },

  // Employees / Tenant Users
  async getTenantEmployees() {
    const res = await fetch(`${API_BASE}/auth/users`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch employees');
    return data.data || [];
  },

  // Demo Seed Workspace
  async seedDemoWorkspace() {
    const res = await fetch(`${API_BASE}/auth/demo-seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to seed workspace');
    return data.data;
  },
};
