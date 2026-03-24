import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4">Student Token Launchpad</h1>
        <p className="text-xl text-gray-600 mb-12">Select your portal to continue</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div 
            onClick={() => navigate('/admin/login')}
            className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500 flex flex-col items-center"
          >
            <div className="text-4xl mb-4 text-blue-500">👨‍💼</div>
            <h2 className="text-2xl font-bold text-gray-800">Admin</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Create events, manage points, and generate reward codes.</p>
          </div>

          {/* Student Card */}
          <div 
            onClick={() => navigate('/student/login')}
            className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-indigo-500 flex flex-col items-center"
          >
            <div className="text-4xl mb-4 text-indigo-500">🎓</div>
            <h2 className="text-2xl font-bold text-gray-800">Student</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">View events, redeem reward codes, and track tokens.</p>
          </div>

          {/* Vendor Card */}
          <div 
            onClick={() => navigate('/vendor/login')}
            className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-green-500 flex flex-col items-center"
          >
            <div className="text-4xl mb-4 text-green-500">🏪</div>
            <h2 className="text-2xl font-bold text-gray-800">Vendor</h2>
            <p className="text-gray-500 mt-2 text-sm text-center">Redeem campus points from students for goods.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
