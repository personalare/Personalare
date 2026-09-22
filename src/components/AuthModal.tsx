import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Lock, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        return;
      }
      const res = login(email, password);
      if (!res.success) {
        setError(res.message || 'Login failed. Account not found.');
      } else {
        setSuccessMsg('Welcome back! Logged in successfully.');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        setError('Please fill in your name, email, and phone number.');
        return;
      }
      const res = signup(name, email, phone, password);
      if (!res.success) {
        setError(res.message || 'Registration failed.');
      } else {
        setSuccessMsg('Account created successfully! You can now book your stay.');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    }
  };

  const handleQuickDemoSelect = (userId: string) => {
    switchUser(userId);
    setSuccessMsg('Switched demo account!');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const sampleUsers = StorageService.getUsers();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden text-gray-900"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                CH
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-bold">
                  Cloud Heaven, Vagamon
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {mode === 'login' ? 'Customer Sign In' : 'Create Guest Account'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-2 bg-gray-100 border-b border-gray-200/70 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-center rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-center rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Mathew"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.mathew@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Phone Number (for booking voucher & gate entry)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Password {mode === 'login' && <span className="text-gray-400 font-normal lowercase">(demo: any password)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md shadow-emerald-900/10 transition-all mt-2 cursor-pointer"
            >
              {mode === 'login' ? 'Sign In to Account' : 'Create Account & Continue'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Instant One-Click Demo Switcher:</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {sampleUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoSelect(u.id)}
                  className="flex items-center justify-between px-3 py-2 text-xs bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    <div>
                      <span className="font-bold text-gray-900">{u.name}</span>
                      <span className="text-gray-400 ml-1.5 font-normal">({u.email})</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      u.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
