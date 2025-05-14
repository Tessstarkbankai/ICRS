import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabaseClient } from '../lib/supabase';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isAnonymous: false,
    studentName: '',
    studentEmail: '',
  });

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      await supabaseClient.checkConnection();
      setIsSupabaseReady(true);
    } catch (error) {
      console.error('Supabase connection error:', error);
      toast.error('Unable to connect to the server. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseReady) {
      toast.error('Unable to connect to the server. Please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      await supabaseClient.submitComplaint({
        title: formData.title.trim(),
        description: formData.description.trim(),
        is_anonymous: formData.isAnonymous,
        student_name: formData.isAnonymous ? null : formData.studentName.trim(),
        student_email: formData.isAnonymous ? null : formData.studentEmail.trim(),
      });

      toast.success('Complaint submitted successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit a Complaint</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>

          {!formData.isAnonymous && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isSupabaseReady}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-indigo-400"
          >
            <Send className="h-5 w-5" />
            <span>
              {isLoading ? 'Submitting...' : !isSupabaseReady ? 'Connecting...' : 'Submit Complaint'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;