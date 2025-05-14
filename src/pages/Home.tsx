import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Shield, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Complaint } from '../lib/supabase';

const Home = () => {
  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResolvedComplaints = async () => {
    try {
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('status', 'RESOLVED')
        .order('updated_at', { ascending: false })
        .limit(6);

      setResolvedComplaints(data || []);
    } catch (error) {
      console.error('Error fetching resolved complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResolvedComplaints();
    
    const channel = supabase
      .channel('public:complaints')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: 'status=eq.RESOLVED'
        },
        () => {
          // Refetch the complaints whenever there's any change
          fetchResolvedComplaints();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Invertis Complaint Raise System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A safe and efficient way to submit your complaints and concerns. We're here to listen and help resolve your issues.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <MessageSquare className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Anonymous Submission</h3>
          <p className="text-gray-600">
            Submit your complaints anonymously without revealing your identity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <Shield className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your complaints are handled with utmost privacy and security.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-indigo-600 mb-4">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Quick Resolution</h3>
          <p className="text-gray-600">
            Get timely updates on the status of your complaints.
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-8 text-center mb-16">
        <h2 className="text-3xl font-bold text-indigo-900 mb-4">
          Ready to Submit a Complaint?
        </h2>
        <p className="text-lg text-indigo-700 mb-6">
          We're here to help address your concerns and make positive changes.
        </p>
        <Link
          to="/submit"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-500 transition-colors"
        >
          Submit Now
        </Link>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: '1',
              title: 'Submit Complaint',
              description: 'Fill out the complaint form with your concerns',
            },
            {
              step: '2',
              title: 'Review Process',
              description: 'Admins review and validate your complaint',
            },
            {
              step: '3',
              title: 'Investigation',
              description: 'Thorough investigation of the reported issue',
            },
            {
              step: '4',
              title: 'Resolution',
              description: 'Implementation of solution and closure',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Recently Resolved Issues
        </h2>
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedComplaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {complaint.image_url && (
                  <img
                    src={complaint.image_url}
                    alt="Resolution"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.title}
                    </h3>
                    <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                      Resolved
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {complaint.description.length > 150
                      ? `${complaint.description.substring(0, 150)}...`
                      : complaint.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {complaint.is_anonymous
                        ? 'Anonymous'
                        : complaint.student_name}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;