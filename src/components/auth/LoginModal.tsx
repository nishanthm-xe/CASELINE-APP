import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import {
  X,
  Lock,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';

export const LoginModal: React.FC = () => {
  const { activeModal, setActiveModal, login, loginDemoPatient, loginDemoDoctor, addToast } = useApp();

  const [identifier, setIdentifier] = useState('patient@example.com');
  const [password, setPassword] = useState('demo123');
  const [roleHint, setRoleHint] = useState<'patient' | 'doctor'>('patient');
  const [submitting, setSubmitting] = useState(false);

  if (activeModal !== 'login') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(identifier, password, roleHint);
    } catch (err: any) {
      // toast already shown in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="login-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 relative overflow-hidden"
      >
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3 shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to CASE LINE</h2>
          <p className="text-xs text-slate-600 mt-1">
            Access your secure health repository or clinical workstation.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setRoleHint('patient');
              setIdentifier('patient@example.com');
              setPassword('demo123');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              roleHint === 'patient'
                ? 'bg-white text-teal-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleHint('doctor');
              setIdentifier('doctor@example.com');
              setPassword('demo123');
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              roleHint === 'doctor'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {roleHint === 'patient' ? 'Patient ID / Email / Mobile' : 'Doctor ID / Council Reg # / Email'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder={roleHint === 'patient' ? 'PT-000001 or email' : 'DR-000001 or email'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all ${
              roleHint === 'patient'
                ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitting ? 'Signing In...' : `Sign In as ${roleHint === 'patient' ? 'Patient' : 'Doctor'}`}</span>
          </button>
        </form>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Instant 1-Click Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={loginDemoPatient}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Patient</span>
            </button>
            <button
              type="button"
              onClick={loginDemoDoctor}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Doctor</span>
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setActiveModal('role_select')}
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              Don't have an account? Register here
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
