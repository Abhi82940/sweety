import React from 'react';
import { Heart, ShieldCheck, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-purple-100 bg-white/70 py-6 text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-purple-700">Sweety</span>
          <span>&copy; {new Date().getFullYear()} Blood Glucose Tracking and Reporting System</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Data Isolation Protected
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            Standard Range: 70 - 140 mg/dl
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
