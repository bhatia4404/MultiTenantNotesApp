export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
  tenant_id: string;
  created_at: string;
  subscription_plan: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  subscription_plan: "free" | "pro";
  created_at?: string;
}

export interface Note {
  id: number;
  tenant_id: string;
  user_id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    tenantName: string;
  };
  token?: string;
}
