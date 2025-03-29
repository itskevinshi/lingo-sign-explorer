
import React from 'react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">SignLingo</h1>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Learn American Sign Language</h2>
        <p className="text-gray-600 text-center mb-8">
          Welcome to SignLingo, your interactive platform for learning American Sign Language (ASL).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Interactive Lessons</h3>
            <p className="text-gray-600">Learn ASL through engaging interactive lessons designed for all skill levels.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Practice Mode</h3>
            <p className="text-gray-600">Practice your signing skills with real-time feedback using your camera.</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
