import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
} from 'lucide-react';
import { authAPI } from '../services/api';

export const LoginScreen = ({ onLoginSuccess, settings }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await authAPI.login({
        identifier: identifier.trim(),
        password,
      });

      if (res.data?.success && res.data?.user) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        setErrorMessage(res.data?.message || 'Authentication failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback offline validation if server request fails
      const cleanId = identifier.trim().toLowerCase();
      if (cleanId === 'shrikant' && password === 'Shrikant@SSC2024') {
        onLoginSuccess(
          {
            id: 'usr-001',
            email: 'shrikant@shreesaiclasses.edu.in',
            username: 'shrikant',
            name: 'Shrikant Chavan',
            role: 'teacher_school',
            section: 'school',
            title: 'School Section In-Charge (Classes 6th - 10th)',
          },
          `offline-token-${Date.now()}`
        );
      } else if (cleanId === 'sangita' && password === 'Sangita@SSC2024') {
        onLoginSuccess(
          {
            id: 'usr-002',
            email: 'sangita@shreesaiclasses.edu.in',
            username: 'sangita',
            name: 'Sangita Chavan',
            role: 'teacher_college',
            section: 'college',
            title: 'Commerce Section In-Charge (FYJC & SYJC)',
          },
          `offline-token-${Date.now()}`
        );
      } else if (cleanId === 'admin' && password === 'Admin@SSC2024') {
        onLoginSuccess(
          {
            id: 'usr-003',
            email: 'admin@shreesaiclasses.edu.in',
            username: 'admin',
            name: 'Admin / Director',
            role: 'admin',
            section: 'all',
            title: 'Principal / Management',
          },
          `offline-token-${Date.now()}`
        );
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            'Invalid email/username or password. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full my-auto relative z-10 animate-in fade-in zoom-in duration-200">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-blue-950 to-slate-900 px-6 pt-8 pb-6 text-center text-white relative">
            <div className="inline-flex h-20 w-20 rounded-2xl bg-white p-1 items-center justify-center border-2 border-red-600 shadow-xl mb-3 overflow-hidden">
              <img src="/logo.png" alt="Shree Sai Classes" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-xl font-black font-heading tracking-tight">
              {settings?.instituteName || 'SHREE SAI CLASSES'}
            </h1>
            <p className="text-[11px] text-red-300 font-bold mt-1">
              Teacher & Staff Billing Management Portal
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Authorized Personnel Only
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Error Notice */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="font-bold">Error:</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or username"
                    autoComplete="username"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-850 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 text-amber-300" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          © {new Date().getFullYear()} Shree Sai Classes. Session persists until logout.
        </p>
      </div>
    </div>
  );
};
