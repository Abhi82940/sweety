import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  Activity,
  Calendar,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async () => {
    try {
      await login('demo@sweety.com', 'SweetyDemo@123');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-indigo-50/20 text-slate-800 flex flex-col">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900 bg-clip-text text-transparent">
              Sweety
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 hover:shadow-lg transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center relative">
        {/* Soft Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          Modern Medical Glucose Monitoring Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Intelligent Blood Glucose Tracking{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
            Made Simple & Beautiful.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Sweety empowers diabetes patients to log up to four daily glucose readings, analyze
          comprehensive month-to-date and calendar trends, and achieve balanced metabolic health with
          zero hassle.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-purple-200 hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <button
            onClick={handleQuickDemoLogin}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-purple-700 bg-white hover:bg-purple-50/80 border border-purple-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Try Instant Demo (1-Click)</span>
          </button>
        </div>

        {/* Demo Credentials Highlight */}
        <div className="mt-8 max-w-md mx-auto p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Demo Account:</span>
          <code>demo@sweety.com</code>
          <span className="text-slate-300">|</span>
          <code>SweetyDemo@123</code>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered For Clinical Accuracy & Ease
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Everything you need to monitor, manage, and understand your diabetes markers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">4 Daily Reading Slots</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track fasting morning glucose, after breakfast, after lunch, and after dinner. Strict
              single-slot validation guarantees clean, duplicate-free daily records.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clinical Reports & Trends</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly view Daily, Month-to-Date, and complete previous month reports with highest,
              lowest, and average readings rounded accurately to one decimal place.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real Database Recharts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive, responsive line and bar charts powered directly by your PostgreSQL
              readings. Never fabricated, completely personalized.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Multi-Tenant Data Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strict user isolation ensured at database and API layers. Every patient sees solely
              their own records protected by JWT and Bcrypt hashing.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Clinical Insights</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Immediate feedback on readings with color-coded indicators for Normal, Pre-diabetes,
              and High ranges aligned with medical standards.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Export & History</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Easily edit, delete, filter, and export readings to CSV to share directly with your
              endocrinologist or primary care physician.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-purple-100 bg-white py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Sweety — Blood Glucose Tracking and Reporting System.</p>
        <p className="mt-1 text-slate-400">All medical records stored securely in PostgreSQL.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
