import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LayoutDashboard,
  History,
  FileBarChart2,
  User,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Droplets
} from 'lucide-react';

const Navbar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/history', label: 'Reading History', icon: History },
    { path: '/reports', label: 'Reports', icon: FileBarChart2 },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-200 group-hover:scale-105 transition-transform duration-200">
                <Droplets className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                  Sweety
                </span>
                <span className="hidden sm:inline-block text-xs text-purple-600 font-medium ml-1.5 px-2 py-0.5 bg-purple-50 rounded-full border border-purple-200">
                  Glucose Tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center ml-8 space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-purple-100/70 text-purple-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-purple-700' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Reading</span>
              </button>
            )}

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SW'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name || 'Patient'}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {user?.email || ''}
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="p-2 text-purple-700 bg-purple-100 rounded-lg cursor-pointer"
                title="Add Reading"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-purple-700 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-2">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                  active
                    ? 'bg-purple-100 text-purple-900 font-semibold'
                    : 'text-slate-600 hover:bg-purple-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-purple-700' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-base font-medium"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
