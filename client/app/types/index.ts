export interface Employee {
  id: number;
  name: string;
  role: string;
  created_at?: string;
}

export interface Device {
  id: number;
  name: string;
  type: string;
  owner_id: number | null;
  owner_name?: string;
  owner_role?: string;
  created_at?: string;
}

