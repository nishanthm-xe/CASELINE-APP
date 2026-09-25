import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  User,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Droplets,
  Award,
  Lock,
  Tent,
  CheckCircle,
} from 'lucide-react';

export const PatientProfileView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const patient = user?.patientData;
  const [campRegistrations, setCampRegistrations] = useState<any[]>([]);

  useEffect(() => {
    if (patient?.id) {
      api.getHealthCampRegistrations(patient.id).then((regs) => {
        if (Array.isArray(regs)) setCampRegistrations(regs);
      }).catch(() => {});
    }
  }, [patient?.id]);

  if (!patient) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
          <User className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Profile Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Please make sure you are logged into a patient account to view verified demographic credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('medical_records')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          View Medical Records
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Identity & Demographics</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Patient Health Profile</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Your foundational biological and demographic credentials stored under sovereign identity control.
          </p>
        </div>

        <div className="px-3 py-1 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>UIDAI Mock Verified</span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-2xl shadow-xs">
            {(patient.fullName || 'Patient').split(' ').filter(Boolean).map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900">{patient.fullName}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
              {campRegistrations.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1">
                  <Tent className="w-3 h-3 text-teal-700" />
                  <span>Health Camp Participant ({campRegistrations.length})</span>
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-teal-600 font-semibold mt-0.5">
              Permanent Patient Identifier: {patient.patientCode}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Age & Gender</span>
            <strong className="text-slate-900 font-semibold text-sm">{patient.age} Years • {patient.gender}</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Date of Birth</span>
            <strong className="text-slate-900 font-semibold text-sm">{patient.dob}</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Blood Group</span>
            <strong className="text-rose-600 font-black text-sm">{patient.bloodGroup}</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
            <strong className="text-slate-900 font-mono font-semibold text-sm">{patient.phone || patient.mobile}</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Email Address</span>
            <strong className="text-slate-900 font-semibold text-sm">{patient.email}</strong>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-slate-400 block text-[11px]">Aadhaar (Masked)</span>
            <strong className="text-slate-900 font-mono text-sm">•••• •••• 3912</strong>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 sm:col-span-3">
            <span className="text-slate-400 block text-[11px]">Residential Address</span>
            <strong className="text-slate-900 text-sm">
              {patient.address}, {patient.city}, {patient.state} - {patient.pincode}
            </strong>
          </div>
        </div>

        {/* Emergency Contact Summary */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">
              Next-of-Kin Proxy: {patient.emergencyContact?.name} ({patient.emergencyContact?.relationship})
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {patient.emergencyContact?.phone || patient.emergencyContact?.phoneNumber}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('emergency')}
            className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors"
          >
            Manage Emergency Contact
          </button>
        </div>
      </div>
    </div>
  );
};
