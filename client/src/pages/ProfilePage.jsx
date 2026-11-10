import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  LogOut,
  ShieldCheck,
  Activity,
  Heart,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { formatDisplayDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          Patient Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View your account information and clinical management references.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-purple-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SW'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Patient'}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-purple-600" />
                {user?.email}
              </p>
              <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Verified Patient Account
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-center px-5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Account Details Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Full Legal Name
            </span>
            <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Primary Email
            </span>
            <span className="text-sm font-semibold text-slate-800">{user?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Account Created
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {user?.createdAt ? formatDisplayDate(user.createdAt.slice(0, 10)) : 'Recent'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Database Isolation
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              PostgreSQL multi-tenant protected
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Target Ranges Reference Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-bold text-slate-900">
            Clinical Reference Targets (ADA Guidelines)
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Standard American Diabetes Association (ADA) plasma blood glucose reference targets for
          non-pregnant adults with diabetes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-900">Morning Fasting Glucose</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Slot 1
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              70 – 99 <span className="text-xs font-normal text-slate-500">mg/dl (Normal)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              100 - 125 mg/dl indicates pre-diabetes; 126+ mg/dl indicates elevated fasting glucose.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-900">Post-Meal (1-2h After Meals)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Slots 2, 3 & 4
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              &lt; 140 <span className="text-xs font-normal text-slate-500">mg/dl (Normal)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              140 - 199 mg/dl indicates borderline high; 200+ mg/dl indicates elevated post-prandial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
