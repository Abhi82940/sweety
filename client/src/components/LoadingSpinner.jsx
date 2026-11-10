import React from 'react';
import { Droplets } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading your glucose records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-purple-100 border-t-purple-600 animate-spin" />
        <Droplets className="w-5 h-5 text-purple-600 absolute animate-pulse" />
      </div>
      <p className="text-xs font-medium text-slate-500 mt-4 tracking-wide">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
