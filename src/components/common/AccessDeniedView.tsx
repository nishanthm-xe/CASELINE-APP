import React from 'react';
import { useApp } from '../../lib/store';
import { ShieldAlert, ArrowLeft, Stethoscope, UserCheck, Lock } from 'lucide-react';

interface AccessDeniedViewProps {
  attemptedTab?: string;
  requiredRole?: 'doctor' | 'patient';
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedTab, requiredRole }) => {
  const { user, role, setActiveTab } = useApp();

  const isPatientTryingDoctor = role === 'patient' || requiredRole === 'doctor';

  return (
    <div id="access-denied-container" className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
            <Lock className="w-3.5 h-3.5" />
            <span>Role Authorization Enforced</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {isPatientTryingDoctor
              ? 'This section is part of the Certified Clinician Workstation and requires verified Medical Council credentials. Patient accounts cannot access provider management or directory search tools.'
              : 'This section is reserved for patient personal health intake and self-care tracking. Certified clinicians should utilize the Doctor Portal to review consented records and conduct patient encounters.'}
          </p>

          {attemptedTab && (
            <div className="text-xs font-mono text-slate-400 mt-2">
              Attempted View: <span className="text-slate-600 font-semibold">{attemptedTab}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-md mx-auto text-left flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl border border-slate-200 text-teal-600 shrink-0 mt-0.5">
            {role === 'patient' ? <UserCheck className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
          </div>
          <div className="text-xs text-slate-600">
            <div className="font-bold text-slate-800">
              Authenticated Account: {user?.fullName || 'User'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Role: <span className="font-semibold text-slate-700 uppercase">{role || 'Unassigned'}</span> • {role === 'patient' ? user?.patientData?.patientCode : user?.doctorData?.doctorCode}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            id="access-denied-return-btn"
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
