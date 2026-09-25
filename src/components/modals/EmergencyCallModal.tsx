import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import {
  PhoneCall,
  X,
  AlertTriangle,
  MapPin,
  Heart,
  Droplets,
  ShieldAlert,
  PhoneOff,
  Radio,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmergencyCallModal: React.FC = () => {
  const { activeModal, setActiveModal, user } = useApp();
  const [activeCallNumber, setActiveCallNumber] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any;
    if (activeCallNumber) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCallNumber]);

  if (activeModal !== 'emergency_call') return null;

  const patient = user?.patientData;
  const emergencyContact = patient?.emergencyContact;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="emergency-call-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-rose-200 overflow-hidden relative"
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white animate-pulse">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>Emergency Response Station</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/50 text-[10px] uppercase font-bold tracking-wider">
                  Live
                </span>
              </h3>
              <p className="text-xs text-rose-100">Direct dispatch & critical patient telemetrics</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveCallNumber(null);
              setActiveModal(null);
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Call In-Progress Simulator */}
          <AnimatePresence>
            {activeCallNumber && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-2 overflow-hidden"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Call Connected: {activeCallNumber}</span>
                </div>
                <div className="text-2xl font-mono font-bold text-rose-950">{formatSeconds(callDuration)}</div>
                <p className="text-xs text-rose-800">
                  Simulated dispatch operator responding. GPS coordinates transmitted to ambulance terminal.
                </p>
                <button
                  onClick={() => setActiveCallNumber(null)}
                  className="mt-2 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>End Call Simulation</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Direct Emergency Numbers */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Instant Dispatch Helplines
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveCallNumber('108 (National Ambulance)')}
                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                    <span className="text-base font-black text-rose-600">108</span>
                    <span>Ambulance</span>
                  </div>
                  <div className="text-[11px] text-rose-800 mt-0.5">Emergency Medical Service</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => setActiveCallNumber('112 (National Emergency)')}
                className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
                    <span className="text-base font-black text-sky-600">112</span>
                    <span>All-in-One</span>
                  </div>
                  <div className="text-[11px] text-sky-800 mt-0.5">Police, Fire & Medical</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Patient Emergency Contact Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Designated Next-of-Kin
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {emergencyContact?.name || 'Meera Sharma'} ({emergencyContact?.relationship || 'Spouse'})
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Phone: <strong className="font-mono text-slate-800">{emergencyContact?.phone || emergencyContact?.phoneNumber || '+91 9876543211'}</strong>
                </div>
              </div>
              <button
                onClick={() => setActiveCallNumber(`${emergencyContact?.name || 'Meera Sharma'} (${emergencyContact?.phone || emergencyContact?.phoneNumber || '9876543211'})`)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Contact</span>
              </button>
            </div>
          </div>

          {/* First Responder Vital Telemetrics */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Paramedic Quick Reference Telemetry
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">Blood Type</div>
                <div className="font-bold text-rose-400 text-sm">{patient?.bloodGroup || 'O+'}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400">Patient ID</div>
                <div className="font-mono font-bold text-teal-400 text-xs">{patient?.patientCode || 'PT-000001'}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400">Allergies</div>
                <div className="font-semibold text-amber-300 text-xs">Penicillin</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Location: 12.9279° N, 77.6271° E (Bellandur, Bengaluru)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
