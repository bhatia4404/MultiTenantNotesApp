// Types for authentication
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

// Types for notes
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  users: {
    id: number;
    name: string;
    email: string;
  };
}

// Types for tenants
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  limitReached?: boolean;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (tenantId: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}