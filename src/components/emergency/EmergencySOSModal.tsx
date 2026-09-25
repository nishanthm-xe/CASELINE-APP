import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Ambulance,
  ShieldCheck,
  CheckCircle2,
  X,
  Radio,
  Clock,
  Heart,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, addToast, t, setActiveTab } = useApp();
  const [isActivating, setIsActivating] = useState(false);
  const [activeSOS, setActiveSOS] = useState<any>(null);
  const [locCoordinates, setLocCoordinates] = useState({ lat: 12.9249, lng: 77.5834 });
  const [address, setAddress] = useState('Jayanagar 4th Block, Bengaluru, Karnataka');
  const [criticalNotes, setCriticalNotes] = useState('Acute chest discomfort & breathlessness');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [confirmCall, setConfirmCall] = useState<{ name: string; number: string; role: string } | null>(null);

  const patientName = user?.fullName || 'Rajesh Sharma';
  const patientCode = user?.patientData?.patientCode || 'PT-000001';
  const bloodGroup = user?.patientData?.bloodGroup || 'O+';
  const allergies = user?.patientData?.allergies && user.patientData.allergies.length > 0 
    ? user.patientData.allergies.join(', ') 
    : 'Penicillin, Sulfa drugs';
  const criticalInfo = user?.patientData?.criticalConditions && user.patientData.criticalConditions.length > 0
    ? user.patientData.criticalConditions.join(', ')
    : 'Type 2 Diabetes Mellitus, Essential Hypertension';
  const emergencyContactName = user?.patientData?.emergencyContact?.name || 'Meera Sharma (Spouse)';
  const emergencyContactPhone = user?.patientData?.emergencyContact?.phone || '+91 98765 43211';

  // Fetch active SOS if already activated
  useEffect(() => {
    if (isOpen) {
      api.getActiveSOS().then((activeList) => {
        if (activeList && activeList.length > 0) {
          setActiveSOS(activeList[0]);
        }
      }).catch(console.error);

      // Attempt HTML5 Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocCoordinates({
              lat: Number(pos.coords.latitude.toFixed(4)),
              lng: Number(pos.coords.longitude.toFixed(4)),
            });
            setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Bengaluru)`);
          },
          (err) => {
            console.warn('Geolocation denied or unavailable, using fallback', err);
          },
          { timeout: 5000 }
        );
      }
    }
  }, [isOpen]);

  const handleBroadcastSOS = async () => {
    setIsActivating(true);
    try {
      const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id;
      const res = await api.triggerEmergencySOS({
        patientId: patientId || 'pat-001',
        patientName: user?.fullName || 'Rajesh Sharma',
        patientCode: user?.patientData?.patientCode || 'PT-000001',
        latitude: locCoordinates.lat,
        longitude: locCoordinates.lng,
        locationAddress: address,
        emergencyContactPhone: user?.patientData?.emergencyContact?.phone || '+91 98765 43211',
        criticalNotes,
      });

      setActiveSOS(res.sos);
      addToast(t.sosActivated, 'error');
    } catch (err: any) {
      addToast(err.message || 'Failed to trigger SOS', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSOS) return;
    try {
      await api.resolveSOS(activeSOS.id);
      setActiveSOS(null);
      addToast('Emergency SOS marked as resolved', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to resolve SOS', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="emergency-sos-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-rose-500/50 overflow-hidden"
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-pulse shrink-0">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">{t.emergencySOS}</h2>
                <span className="px-2 py-0.5 text-xs font-bold bg-white text-rose-700 rounded-full uppercase tracking-wider">
                  Critical Mode
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-1">
                Direct integration with National Emergency Hub (108), GPS dispatch & verified emergency contacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-rose-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Essential Emergency Information (Section 1 compliant: No complete medical history, essential only) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient Identification</span>
                <div className="text-base font-black text-slate-900">{patientName}</div>
                <div className="text-xs font-mono text-teal-700 font-semibold">{patientCode}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Blood Group</span>
                <div className="text-2xl font-black text-rose-600">{bloodGroup}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Known Allergies</span>
                <span className="font-semibold text-rose-700">{allergies}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Critical Medical Info</span>
                <span className="font-semibold text-slate-800">{criticalInfo}</span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Emergency Contact</span>
                <span className="font-bold text-slate-900">{emergencyContactName}</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">{emergencyContactPhone}</span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">Nearby Hospitals on Alert</span>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-medium">Apollo Memorial (1.4 km • Trauma Unit)</span>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-medium">Fortis Emergency (2.1 km • 24/7 ICU)</span>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md font-medium">Manipal Hospital (3.5 km)</span>
              </div>
            </div>
          </div>

          {/* Section 1 Required Action Buttons: Call Contact, Find Hospital, Call Emergency Services */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">Emergency Actions</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setConfirmCall({ name: emergencyContactName, number: emergencyContactPhone, role: 'Emergency Contact' })}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call Emergency Contact</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('nearby');
                }}
                className="p-3.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <MapPin className="w-5 h-5" />
                <span>Find Nearby Hospital</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmCall({ name: '108 National Ambulance Command', number: '108', role: 'National Emergency Service' })}
                className="p-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Ambulance className="w-5 h-5" />
                <span>Call Emergency Services (108)</span>
              </button>
            </div>
          </div>

          {activeSOS ? (
            /* Active Emergency Response State */
            <div className="p-5 bg-rose-50/80 rounded-xl border border-rose-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                    Emergency Alert Active
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  ID: {activeSOS.id}
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-rose-100">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Ambulance className="w-4 h-4 text-rose-600" />
                    Ambulance Dispatch
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">Dispatched (108)</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">ETA: ~{activeSOS.ambulanceEtaMinutes || 7} mins</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-rose-100">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    Assigned Care Center
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1 leading-tight">
                    {activeSOS.assignedHospital || 'Apollo Memorial Emergency Unit'}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-rose-100">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Blood Group
                  </div>
                  <div className="text-lg font-black text-rose-700 mt-0.5">
                    {activeSOS.bloodGroup || 'O+'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-100 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">Broadcast Coordinates:</div>
                <div className="font-mono text-slate-600">{activeSOS.locationAddress}</div>
                <div className="text-[11px] text-slate-500">
                  Latitude: {activeSOS.latitude}, Longitude: {activeSOS.longitude}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleResolveSOS}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
                >
                  Mark Emergency Resolved (I Am Safe)
                </button>
              </div>
            </div>
          ) : (
            /* SOS Trigger Setup */
            <div className="space-y-4">
              {/* Geolocation Detection Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                <Navigation className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Current GPS Coordinates</div>
                  <div className="text-xs text-slate-600 font-mono truncate mt-0.5">{address}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Lat: {locCoordinates.lat} | Lng: {locCoordinates.lng}
                  </div>
                </div>
              </div>

              {/* Patient Emergency Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Symptoms / Immediate Distress Description
                </label>
                <input
                  type="text"
                  value={criticalNotes}
                  onChange={(e) => setCriticalNotes(e.target.value)}
                  placeholder="e.g. Severe chest pain, allergic shock, fall with trauma..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              {/* Big Red SOS Action Button */}
              <div className="pt-2 text-center">
                <button
                  id="trigger-sos-action-btn"
                  onClick={handleBroadcastSOS}
                  disabled={isActivating}
                  className="w-full py-4 px-6 text-base font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                >
                  <Radio className="w-6 h-6 animate-ping text-rose-200" />
                  <span>{isActivating ? 'Broadcasting Alert...' : 'BROADCAST EMERGENCY SOS NOW'}</span>
                </button>
                <p className="text-[11px] text-slate-500 mt-2">
                  Immediately transmits your encrypted location, blood group, allergies, and emergency profile to 108 network.
                </p>
              </div>
            </div>
          )}

          {/* Quick Dial Emergency Numbers */}
          <div>
            <div className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Direct National Medical Helplines
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href="tel:108"
                className="p-3 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  108
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Ambulance Service</div>
                  <div className="text-[10px] text-slate-500">24/7 National Dispatch</div>
                </div>
              </a>

              <a
                href="tel:112"
                className="p-3 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  112
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">National Emergency</div>
                  <div className="text-[10px] text-slate-500">Police, Fire & Medical</div>
                </div>
              </a>

              <a
                href="tel:104"
                className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                  104
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Health Advice Line</div>
                  <div className="text-[10px] text-slate-500">Medical Consultation</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Call Confirmation Dialog (Section 1: Use confirmation before triggering calls) */}
        <AnimatePresence>
          {confirmCall && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Emergency Call?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    You are about to dial <span className="font-bold text-slate-900">{confirmCall.name}</span> ({confirmCall.number}).
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmCall(null)}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <a
                    href={`tel:${confirmCall.number}`}
                    onClick={() => {
                      addToast(`Calling ${confirmCall.name}...`, 'info');
                      setConfirmCall(null);
                    }}
                    className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Confirm & Call</span>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>CASE LINE Disaster & First Responder Protocol Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
};
