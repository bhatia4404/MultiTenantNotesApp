'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { Header } from '../components/Header';
import NotesContainer from '../components/NotesContainer';
import SubscriptionModal from '../components/SubscriptionModal';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Helper function to get the current tenant's subscription plan
  const getTenantSubscriptionPlan = (tenantId: string): string => {
    if (typeof window === 'undefined') return 'free';
    
    try {
      const storedSubscriptions = localStorage.getItem('tenantSubscriptions');
      if (!storedSubscriptions) return 'free';
      
      const subscriptions = JSON.parse(storedSubscriptions);
      return subscriptions[tenantId] || 'free';
    } catch (err) {
      console.error('Error reading subscription data:', err);
      return 'free';
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
              <span className="text-gray-500">•</span>
              <p className="text-gray-600 font-medium">{user.tenantName}</p>
            </div>
          </div>
          
          {user.role === 'admin' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                Admin Dashboard
              </button>
            </div>
          )}
        </div>
        
        {user.role === 'admin' && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Subscription Status</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Current Plan:</span>
                    {(() => {
                      const isPro = getTenantSubscriptionPlan(user.tenantId) === 'pro';
                      
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPro
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isPro ? 'Pro' : 'Free'}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Notes Limit:</span>
                    <span className="text-sm">
                      {(() => {
                        const isPro = getTenantSubscriptionPlan(user.tenantId) === 'pro';
                        return isPro ? 'Unlimited' : 'Maximum 3 notes';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 mt-4 sm:mt-0 ${
                  (() => {
                    const isPro = getTenantSubscriptionPlan(user.tenantId) === 'pro';
                    
                    return isPro
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
                      : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
                  })()
                }`}
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {(() => {
                    const isPro = getTenantSubscriptionPlan(user.tenantId) === 'pro';
                    
                    if (isPro) {
                      return (
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      );
                    } else {
                      return (
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 10l7-7m0 0l7 7m-7-7v18" 
                        />
                      );
                    }
                  })()}
                </svg>
                {(() => {
                  const isPro = getTenantSubscriptionPlan(user.tenantId) === 'pro';
                  return isPro ? 'Downgrade to Free Plan' : 'Upgrade to Pro Plan';
                })()}
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <NotesContainer key={refreshTrigger} />
        </div>
        
        {/* Subscription Modal */}
        {user && user.role === 'admin' && (
          <SubscriptionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            currentPlan={getTenantSubscriptionPlan(user.tenantId) === 'pro' ? 'pro' : 'free'}
            tenantId={user.tenantId}
            onSuccess={() => {
              // This will refresh the notes list and UI
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </main>
    </div>
  );
}