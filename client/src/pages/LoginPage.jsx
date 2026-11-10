import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@sweety.com');
    setPassword('SweetyDemo@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50/50 via-white to-indigo-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform">
            <Droplets className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Welcome back to Sweety
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to access your blood glucose logs and clinical trends
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-purple-100/50 rounded-3xl border border-purple-100 sm:px-10">
          
          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/70 flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Want a quick preview?
              </span>
              <span className="text-[11px] text-slate-500 block">Use pre-seeded demo account</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-white hover:bg-purple-100/80 rounded-xl border border-purple-200 shadow-2xs transition-all cursor-pointer"
            >
              Fill Demo Info
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium text-xs">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-hidden text-slate-800 transition-all"
                />
                <Mail className="w-4 h-4 text-purple-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-hidden text-slate-800 transition-all"
                />
                <Lock className="w-4 h-4 text-purple-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-purple-600 hover:text-purple-700 underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
