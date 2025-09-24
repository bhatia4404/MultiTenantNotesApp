'use client';

import { ApiResponse, Note } from './types';

// Base API client for making authenticated requests
const apiClient = async <T>(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      message: 'An error occurred while fetching data',
    };
  }
};

// Notes API functions
export const notesApi = {
  // Get all notes
  getAll: () => apiClient<Note[]>('/api/notes'),
  
  // Get a note by ID
  getById: (id: number) => apiClient<Note>(`/api/notes/${id}`),
  
  // Create a new note
  create: (note: { title: string; content: string }) => 
    apiClient<Note>('/api/notes', 'POST', note),
  
  // Update a note
  update: (id: number, note: { title: string; content: string }) => 
    apiClient<Note>(`/api/notes/${id}`, 'PUT', note),
  
  // Delete a note
  delete: (id: number) => 
    apiClient<void>(`/api/notes/${id}`, 'DELETE'),
};

// Tenants API
export const tenantsApi = {
  // Get all tenants
  getAll: () => apiClient<any[]>('/api/tenants'),
  
  // Upgrade to Pro plan
  upgradeToPro: (slug: string) => 
    apiClient<any>(`/api/tenants/${slug}/upgrade`, 'POST'),
    
  // Downgrade to Free plan
  downgradeToFree: (slug: string) => 
    apiClient<any>(`/api/tenants/${slug}/downgrade`, 'POST'),
};

// Users API
export const usersApi = {
  // Get all users in tenant (Admin only)
  getAll: () => apiClient<any[]>('/api/users'),
  
  // Invite a new user (Admin only)
  invite: (user: { email: string; name: string; role: string }) => 
    apiClient<any>('/api/users', 'POST', user),
};