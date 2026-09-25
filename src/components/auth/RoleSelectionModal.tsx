import React from 'react';
import { useApp } from '../../lib/store';
import { User, Stethoscope, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const RoleSelectionModal: React.FC = () => {
  const { activeModal, setActiveModal, loginDemoPatient, loginDemoDoctor } = useApp();

  if (activeModal !== 'role_select') return null;

  return (
    <div id="role-selection-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            Welcome to Case Line
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            How would you like to continue?
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            Select your healthcare profile to manage records or connect with patients.
          </p>
        </div>

        {/* Two Large Animated Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Patient Card */}
          <motion.div
            whileHover={{ y: -4, borderColor: '#0d9488' }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveModal('patient_reg')}
            className="group cursor-pointer p-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-teal-50/30 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-900">
                PATIENT
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Manage your complete medical history, biopsy & lab reports, blood emergencies, and consent.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600 group-hover:text-teal-700">
              <span>Register as Patient</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Doctor Card */}
          <motion.div
            whileHover={{ y: -4, borderColor: '#4f46e5' }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveModal('doctor_reg')}
            className="group cursor-pointer p-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-indigo-50/30 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center mb-4 shadow-xs">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-900">
                DOCTOR
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Search patients, manage clinical consultations, request report access, and upload diagnostics.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
              <span>Register as Doctor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>

        {/* Existing User Login Prompt */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="text-xs font-semibold text-slate-900">Already registered on CASE LINE?</div>
            <div className="text-xs text-slate-500">Sign in using your Patient ID, Doctor ID, or Mobile.</div>
          </div>
          <button
            onClick={() => setActiveModal('login')}
            className="px-4 py-2 text-xs font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
          >
            Existing User Login
          </button>
        </div>

        {/* Instant Demo Shortcut */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <span className="text-[11px] font-medium text-slate-400">Instant Demo Evaluation:</span>
          <button
            onClick={loginDemoPatient}
            className="text-[11px] font-semibold text-teal-700 hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Demo Patient
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={loginDemoDoctor}
            className="text-[11px] font-semibold text-indigo-700 hover:underline flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Demo Doctor
          </button>
        </div>
      </motion.div>
    </div>
  );
};
