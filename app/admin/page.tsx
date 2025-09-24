'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Header } from '../components/Header';
import { usersApi, tenantsApi } from '../utils/api-client';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if not admin
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await usersApi.invite({ name, email, role });
      
      if (response.success) {
        setSuccess('User invited successfully!');
        setName('');
        setEmail('');
        setRole('member');
      } else {
        setError(response.message || 'Failed to invite user');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Admin Dashboard
          </h2>
          <p className="text-gray-600 text-lg">
            Manage users and subscription for <span className="font-semibold text-blue-600">{user.tenantName}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invite User Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-lg">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Invite User</h3>
            </div>
            
            {success && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="font-medium">{success}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-2">
                <span className="text-red-500">❌</span>
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleInviteUser} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter user's full name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  User Role
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={role === 'member'}
                      onChange={() => setRole('member')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">👤 Member</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700 font-medium">👑 Admin</span>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Inviting...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Invite User</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white text-lg">💎</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Subscription</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Current Plan:</span>
                <span className={`font-bold text-lg px-3 py-1 rounded-lg ${
                  user.tenantId === 'acme' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.tenantId === 'acme' ? '🚀 Pro' : '🆓 Free'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Notes Limit:</span>
                <span className="font-bold text-gray-900">
                  {user.tenantId === 'acme' ? '♾️ Unlimited' : '📝 3 notes'}
                </span>
              </div>
            </div>
            
            {user.tenantId !== 'acme' ? (
              <div>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to upgrade to the Pro plan?')) {
                      try {
                        const response = await tenantsApi.upgradeToPro(user.tenantId);
                        if (response.success) {
                          alert('Successfully upgraded to Pro plan!');
                          router.refresh();
                        }
                      } catch (error) {
                        console.error('Error upgrading plan:', error);
                      }
                    }
                  }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>⬆️</span>
                  <span>Upgrade to Pro Plan</span>
                </button>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  💡 Pro plan provides unlimited notes for your organization
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl text-green-800 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <span className="font-semibold">You're already on the Pro plan with unlimited notes!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}