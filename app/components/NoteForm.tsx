"use client";
import React, { useState } from "react";

interface NoteFormProps {
  note?: {
    title: string;
    content: string;
  };
  onSubmit: (note: { title: string; content: string }) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function NoteForm({
  note = { title: "", content: "" },
  onSubmit,
  onCancel,
  isEdit = false,
}: NoteFormProps) {
  const [title, setTitle] = useState<string>(note.title || "");
  const [content, setContent] = useState<string>(note.content || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ title, content });
    } catch (error) {
      console.error("Error submitting note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-2xl border border-gray-100 max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? "✏️ Edit Note" : "📝 Create New Note"}
        </h3>
        <p className="text-gray-600">
          {isEdit
            ? "Update your note details below."
            : "Fill out the form to create a new note."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-800"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400"
            placeholder="Enter note title..."
            required
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-gray-800"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
            placeholder="Write your note content here..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>{isEdit ? "Update" : "Create"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
