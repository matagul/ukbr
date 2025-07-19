import React from 'react';

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Translating page, please wait...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg flex flex-col items-center">
      <svg className="animate-spin h-8 w-8 text-red-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="text-lg font-semibold text-gray-800 dark:text-white">{message}</span>
    </div>
  </div>
);

export default LoadingOverlay; 