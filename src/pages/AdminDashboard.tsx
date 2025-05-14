import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Complaint } from '../lib/supabase';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchComplaints();
    ensureStorageBucket();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const ensureStorageBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'resolution-images');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('resolution-images', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to ensure storage bucket exists:', error);
      toast.error('Failed to initialize storage');
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status updated successfully');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      setUploadingId(id);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resolution-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resolution-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('complaints')
        .update({ image_url: publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Image uploaded successfully');
      fetchComplaints();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const complaint = complaints.find(c => c.id === id);
      
      if (complaint?.image_url) {
        const imageKey = complaint.image_url.split('/').pop();
        if (imageKey) {
          const { error: storageError } = await supabase.storage
            .from('resolution-images')
            .remove([imageKey]);
          
          if (storageError) {
            console.error('Failed to delete image:', storageError);
          }
        }
      }

      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setComplaints(complaints.filter(c => c.id !== id));
      toast.success('Complaint deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete complaint');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 text-yellow-600 mb-2">
            <Clock className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Pending</h3>
          </div>
          <p className="text-2xl font-bold">
            {complaints.filter(c => c.status === 'PENDING').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">In Progress</h3>
          </div>
          <p className="text-2xl font-bold">
            {complaints.filter(c => c.status === 'IN_PROGRESS').length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <CheckCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Resolved</h3>
          </div>
          <p className="text-2xl font-bold">
            {complaints.filter(c => c.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Image
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {complaint.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.description.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {complaint.is_anonymous ? (
                      <span className="text-gray-500">Anonymous</span>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.student_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {complaint.student_email}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[complaint.status]}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-2">
                      <select
                        value={complaint.status}
                        onChange={(e) => updateStatus(complaint.id, e.target.value)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <button
                        onClick={() => handleDelete(complaint.id)}
                        disabled={deletingId === complaint.id}
                        className="flex items-center justify-center w-full px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors disabled:bg-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === complaint.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {complaint.status === 'RESOLVED' && (
                      <div className="flex items-center space-x-2">
                        {complaint.image_url ? (
                          <a
                            href={complaint.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            View Image
                          </a>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(complaint.id, file);
                                }
                              }}
                              disabled={uploadingId === complaint.id}
                            />
                            <button
                              className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                              disabled={uploadingId === complaint.id}
                            >
                              <Upload className="h-4 w-4" />
                              <span>
                                {uploadingId === complaint.id
                                  ? 'Uploading...'
                                  : 'Upload Image'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;