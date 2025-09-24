'use client';

import React from 'react';
import { useAuth } from '../contexts/auth-context';

export const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">📝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Multi-Tenant Notes App
                </h1>
                {user && (
                  <span className="text-sm text-blue-600 font-medium">
                    🏢 {user.tenantName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  👋 {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  🏷️ {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-white text-gray-700 font-medium text-sm rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 shadow-sm"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};