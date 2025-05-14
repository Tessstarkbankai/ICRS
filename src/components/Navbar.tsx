import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8" />
            <span className="font-bold text-xl">ICRS</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/submit"
              className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 transition-colors"
            >
              Submit Complaint
            </Link>
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;