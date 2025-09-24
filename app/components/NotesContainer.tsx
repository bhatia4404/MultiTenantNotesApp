'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '../utils/types';
import { notesApi, tenantsApi } from '../utils/api-client';
import { useAuth } from '../contexts/auth-context';
import NoteForm from './NoteForm';

export default function NotesContainer() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [upgradeInProgress, setUpgradeInProgress] = useState<boolean>(false);
  
  const { user } = useAuth();
  
  // Fetch notes on component mount
  const fetchNotes = async () => {
    setIsLoading(true);
    
    try {
      const response = await notesApi.getAll();
      
      if (response.success) {
        setNotes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotes();
  }, []);
  
  // Handle note creation
  const handleCreateNote = async (note: { title: string; content: string }) => {
    try {
      const response = await notesApi.create(note);
      
      if (response.success) {
        fetchNotes();
        setShowCreateForm(false);
      } else if (response.limitReached) {
        setLimitReached(true);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };
  
  // Handle note update
  const handleUpdateNote = async (note: { title: string; content: string }) => {
    if (!editingNote) return;
    
    try {
      const response = await notesApi.update(editingNote.id, note);
      
      if (response.success) {
        fetchNotes();
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };
  
  // Handle note deletion
  const handleDeleteNote = async (id: number) => {
    try {
      const response = await notesApi.delete(id);
      
      if (response.success) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  // Handle upgrade to Pro plan
  const handleUpgrade = async () => {
    if (!user) return;
    
    setUpgradeInProgress(true);
    
    try {
      // Assuming the tenant slug is the same as the tenant ID
      const response = await tenantsApi.upgradeToPro(user.tenantId);
      
      if (response.success) {
        setLimitReached(false);
        // Refresh notes list
        fetchNotes();
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgradeInProgress(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Notes</h3>
        
        {!showCreateForm && !editingNote && (
          <button
            onClick={() => setShowCreateForm(true)}
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
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Create New Note
          </button>
        )}
      </div>
      
      {limitReached && user?.role === 'admin' && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <svg 
              className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5C3.462 16.333 4.423 18 5.982 18z" 
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">Free Plan Limit Reached</h4>
              <p className="text-yellow-700 mb-4">
                Your organization has reached the limit of 3 notes on the free plan.
                Upgrade to Pro for unlimited notes.
              </p>
              <button
                onClick={handleUpgrade}
                disabled={upgradeInProgress}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {upgradeInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Upgrading...
                  </>
                ) : (
                  'Upgrade to Pro Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {limitReached && user?.role !== 'admin' && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <svg 
              className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5C3.462 16.333 4.423 18 5.982 18z" 
              />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">Free Plan Limit Reached</h4>
              <p className="text-yellow-700">
                Your organization has reached the limit of 3 notes on the free plan.
                Please contact your administrator to upgrade to the Pro plan.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showCreateForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <NoteForm
            onSubmit={handleCreateNote}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}
      
      {editingNote && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <NoteForm
            note={editingNote}
            onSubmit={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            isEdit
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <svg 
            className="w-16 h-16 text-gray-300 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-gray-500 text-lg">No notes found</p>
          <p className="text-gray-400 mt-1">Create your first note to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => setEditingNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Note Card Component
function NoteCard({ 
  note, 
  onEdit,
  onDelete 
}: { 
  note: Note; 
  onEdit: () => void;
  onDelete: () => void; 
}) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true);
      await onDelete();
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-900 flex-1 mr-3">{note.title}</h4>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <svg 
              className="w-3 h-3 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ...
              </>
            ) : (
              <>
                <svg 
                  className="w-3 h-3 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
        {note.content}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
        <span className="flex items-center">
          <svg 
            className="w-3 h-3 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
          {note.users.name}
        </span>
        <span className="flex items-center">
          <svg 
            className="w-3 h-3 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          {formatDate(note.created_at)}
        </span>
      </div>
    </div>
  );
}

// Note Card Component