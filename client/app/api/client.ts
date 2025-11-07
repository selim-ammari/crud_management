const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

export async function fetchEmployees(role?: string, name?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (role && role.trim()) params.append('role', role);
  if (name && name.trim()) params.append('name', name);
  const url = `${API_BASE_URL}/employees${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}

export async function fetchEmployee(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`);
  if (!response.ok) throw new Error('Failed to fetch employee');
  return response.json();
}

export async function createEmployee(data: { name: string; role: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create employee: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function updateEmployee(id: number, data: { name: string; role: string }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update employee: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete employee');
}

export async function fetchDevices(type?: string, owner_id?: number, name?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (type && type.trim()) params.append('type', type);
  if (owner_id) params.append('owner_id', owner_id.toString());
  if (name && name.trim()) params.append('name', name);
  const url = `${API_BASE_URL}/devices${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch devices');
  return response.json();
}

export async function fetchDevice(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/devices/${id}`);
  if (!response.ok) throw new Error('Failed to fetch device');
  return response.json();
}

export async function createDevice(data: { name: string; type: string; owner_id?: number | null }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create device: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function updateDevice(id: number, data: { name: string; type: string; owner_id?: number | null }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update device: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function deleteDevice(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete device');
}

