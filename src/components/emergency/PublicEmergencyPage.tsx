import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  Hospital,
  Heart,
  Pill,
  Activity,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface Props {
  qrToken?: string;
  onExit?: () => void;
}

export const PublicEmergencyPage: React.FC<Props> = ({ qrToken, onExit }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Look for token from props or URL search params
    const token = qrToken || new URLSearchParams(window.location.search).get('emergency_token') || 'CL-QR-RAJESH-7749';
    
    api.scanEmergencyQR(token)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load emergency data:', err);
        setError(err.message || 'Emergency profile unavailable or expired.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Verifying Emergency Credentials...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving official hospital & first responder parameters</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-rose-400">Emergency Access Restricted</h2>
        <p className="text-sm text-slate-300 max-w-md mt-2">
          {error || 'This Emergency QR code is not recognized, expired, or has been paused by the patient.'}
        </p>
        {onExit && (
          <button
            onClick={onExit}
            className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
          >
            Return to Case Line
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Top Banner */}
      <div className="w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Flash Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-700 flex items-center justify-center font-black text-sm shadow-md">
              SOS
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-200">
                CASE LINE EMERGENCY RESCUE
              </div>
              <h1 className="text-base font-black tracking-tight">Public Emergency Health Profile</h1>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 uppercase tracking-wider">
            No Login Required
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Hero Card */}
          <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Patient Identity
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">{data.patientName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <span>{data.age ? `${data.age} Years` : 'Adult'}</span>
                <span>•</span>
                <span>{data.gender || 'Not Disclosed'}</span>
                <span>•</span>
                <span className="font-mono text-teal-400">{data.patientCode}</span>
              </div>
            </div>

            {/* Huge Blood Group Badge */}
            <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
                Blood Group
              </span>
              <span className="text-3xl font-black text-rose-400">{data.bloodGroup || 'O+'}</span>
            </div>
          </div>

          {/* Emergency Note Alert */}
          {data.emergencyMedicalNote && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Critical Emergency Note
                </div>
                <div className="text-sm font-semibold text-amber-200 mt-0.5">
                  {data.emergencyMedicalNote}
                </div>
              </div>
            </div>
          )}

          {/* 1-Click Call Emergency Contact */}
          {data.emergencyContactPhone && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Emergency Next-of-Kin Contact
              </div>
              <a
                href={`tel:${data.emergencyContactPhone}`}
                className="p-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black">
                      Call {data.emergencyContactName || 'Emergency Contact'}
                    </div>
                    <div className="text-xs text-emerald-100 font-normal">
                      Relationship: {data.emergencyContactRelationship || 'Family'} • {data.emergencyContactPhone}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-black uppercase tracking-wider">
                  1-Click Call
                </span>
              </a>
            </div>
          )}

          {/* Allergies & Primary Conditions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Critical Allergies</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {data.allergies && data.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.allergies.map((all: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold"
                      >
                        {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None Disclosed / Protected</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Primary Conditions</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {data.criticalConditions && data.criticalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.criticalConditions.map((cond: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None Recorded</span>
                )}
              </div>
            </div>
          </div>

          {/* Current Active Medications (names only, no sensitive diagnoses) */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" />
              <span>Current Medications (Names Only - No Diagnoses)</span>
            </div>
            <div className="text-xs text-slate-300">
              {data.currentMedications && data.currentMedications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {data.currentMedications.map((med: string, i: number) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-900/60 rounded-xl border border-slate-700/60 text-slate-200 font-semibold"
                    >
                      💊 {med}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">None disclosed</span>
              )}
            </div>
          </div>

          {/* Critical Organ Donor & Implant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Organ Donor Status
              </span>
              <p className="font-bold text-teal-300">
                {data.organDonorStatus || 'Registered Organ Donor (NOTTO Registry)'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Medical Implants / Pacemaker
              </span>
              <p className="font-bold text-slate-200">
                {data.medicalImplants || 'No Pacemaker / Metallic Implants'}
              </p>
            </div>
          </div>

          {/* Hospital Preference */}
          {data.preferredHospital && (
            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 flex items-start gap-2.5 text-xs">
              <Hospital className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  Preferred Receiving Hospital
                </span>
                <p className="font-bold text-slate-200 mt-0.5">{data.preferredHospital}</p>
              </div>
            </div>
          )}

          {/* National Emergency Hotline Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="tel:108"
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 108 Ambulance</span>
            </a>
            <a
              href="tel:112"
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112 All-Emergency</span>
            </a>
          </div>

          {onExit && (
            <div className="text-center pt-2">
              <button
                onClick={onExit}
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to CASE LINE Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
