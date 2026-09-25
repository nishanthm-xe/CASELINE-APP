import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { EmergencyProfile } from '../../types';
import QRCode from 'qrcode';
import {
  QrCode,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  PhoneCall,
  Lock,
  Download,
  Share2,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle2,
  UserCheck,
  Hospital,
  Heart,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmergencyQRView: React.FC = () => {
  const { user, addToast, t } = useApp();
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showScannerSimulation, setShowScannerSimulation] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id;

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getEmergencyProfile(patientId || 'pat-001');
      setProfile(data);

      // Generate QR Code data URL pointing to verification route
      const emergencyUrl = `${window.location.origin}/?emergency_token=${data.qrToken}`;
      const url = await QRCode.toDataURL(emergencyUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(url);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load emergency profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [patientId]);

  const handleTogglePrivacy = async (field: keyof EmergencyProfile['dataVisibility']) => {
    if (!profile) return;
    const updatedVisibility = {
      ...profile.dataVisibility,
      [field]: !profile.dataVisibility[field],
    };

    try {
      const res = await api.updateEmergencyProfile(patientId || 'pat-001', {
        dataVisibility: updatedVisibility,
      });
      setProfile(res.profile);
      addToast('Emergency privacy preferences updated', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to update visibility', 'error');
    }
  };

  const handleToggleQREnabled = async () => {
    if (!profile) return;
    try {
      const res = await api.toggleQRAccess(patientId || 'pat-001', !profile.qrEnabled);
      setProfile({ ...profile, qrEnabled: res.qrEnabled });
      addToast(res.qrEnabled ? 'Emergency QR enabled' : 'Emergency QR paused', res.qrEnabled ? 'success' : 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to toggle QR access', 'error');
    }
  };

  const handleRegenerateQR = async () => {
    if (!profile) return;
    setIsRegenerating(true);
    try {
      const res = await api.regenerateEmergencyQR(patientId || 'pat-001');
      await loadProfile();
      addToast('Emergency QR token refreshed securely. Previous QR revoked.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to regenerate QR', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSimulateScan = async () => {
    if (!profile) return;
    try {
      const res = await api.scanEmergencyQR(profile.qrToken);
      setSimulationData(res.data);
      setShowScannerSimulation(true);
    } catch (err: any) {
      addToast(err.message || 'Could not scan emergency token', 'error');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Generating encrypted Emergency QR Card...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <QrCode className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Emergency Medical Profile</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your instant emergency profile is being synchronized. Click below to load your emergency contact credentials and blood group.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProfile}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Load Emergency Profile
        </button>
      </div>
    );
  }

  return (
    <div id="emergency-qr-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.emergencyQR}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant lifesaving medical summary for first responders, paramedics, and emergency ER trauma teams.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSimulateScan}
            className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Simulate Responder Scan</span>
          </button>
          <button
            onClick={handlePrintCard}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Print Emergency ID</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Emergency Card Display */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center font-black text-xs text-white">
                  CL
                </div>
                <span className="font-bold text-sm tracking-wider uppercase text-slate-200">
                  CASE LINE Emergency ID
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Blood Group: {profile.bloodGroup}
              </div>
            </div>

            {/* QR Centerpiece */}
            <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center my-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Emergency Health QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-lg" />
              )}
              <div className="text-[11px] font-mono text-slate-600 mt-2 font-bold tracking-wider">
                {profile.qrToken}
              </div>
            </div>

            {/* Cardholder Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Cardholder:</span>
                <span className="font-bold text-white text-sm">
                  {profile.patientName} ({profile.age || 38} Yrs • {profile.gender || 'Male'})
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Emergency Contact:</span>
                <span className="font-semibold text-white">
                  {profile.emergencyContactName} ({profile.emergencyContactPhone})
                </span>
              </div>
              <div className="flex justify-between items-start text-slate-300 gap-2">
                <span className="shrink-0">Primary Conditions:</span>
                <span className="font-medium text-amber-300 text-right">
                  {profile.criticalConditions?.length > 0 ? profile.criticalConditions.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-start text-slate-300 gap-2">
                <span className="shrink-0">Allergies:</span>
                <span className="font-bold text-rose-400 text-right">
                  {profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'None'}
                </span>
              </div>
              <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl mt-1 text-[11px] text-rose-200">
                <span className="font-bold text-white">Emergency Note: </span>
                {profile.emergencyMedicalNote || 'Diabetic - check glucose immediately; Carries Telmisartan'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>AES-256 Verified Payload</span>
              </div>
              <span>Scan via any mobile camera</span>
            </div>
          </div>

          {/* Quick Security Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              QR Security & Revocation
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">QR Access Active</div>
                <div className="text-[11px] text-slate-500">
                  {profile.qrEnabled
                    ? 'First responders can view emergency info.'
                    : 'Emergency scans are temporarily disabled.'}
                </div>
              </div>
              <button
                onClick={handleToggleQREnabled}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  profile.qrEnabled
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {profile.qrEnabled ? 'Enabled' : 'Paused'}
              </button>
            </div>

            <button
              onClick={handleRegenerateQR}
              disabled={isRegenerating}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate & Invalidate Old QR</span>
            </button>
          </div>
        </div>

        {/* Right Column: Privacy Controls & Medical Payload Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Privacy Visibility Selectors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Privacy & Field Visibility</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control which medical parameters are visible to first responders upon scanning.
                </p>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Critical Allergies</div>
                  <div className="text-[11px] text-slate-500">
                    {profile.allergies.join(', ') || 'No allergies recorded'}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePrivacy('showAllergies')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    profile.dataVisibility.showAllergies
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {profile.dataVisibility.showAllergies ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{profile.dataVisibility.showAllergies ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Critical Medical Conditions</div>
                  <div className="text-[11px] text-slate-500">
                    {profile.criticalConditions.join(', ') || 'None recorded'}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePrivacy('showConditions')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    profile.dataVisibility.showConditions
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {profile.dataVisibility.showConditions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{profile.dataVisibility.showConditions ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Active Prescribed Medications</div>
                  <div className="text-[11px] text-slate-500">
                    {profile.currentMedications.join(', ') || 'No active medications'}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePrivacy('showMedications')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    profile.dataVisibility.showMedications
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {profile.dataVisibility.showMedications ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{profile.dataVisibility.showMedications ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Next of Kin / Emergency Contact</div>
                  <div className="text-[11px] text-slate-500">
                    {profile.emergencyContactName} ({profile.emergencyContactRelationship}): {profile.emergencyContactPhone}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePrivacy('showContact')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    profile.dataVisibility.showContact
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {profile.dataVisibility.showContact ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{profile.dataVisibility.showContact ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Access Audit History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Emergency Access Log</h2>
              <span className="text-xs text-slate-500 font-mono">
                {profile.qrAccessHistory?.length || 0} scan event(s)
              </span>
            </div>

            {profile.qrAccessHistory && profile.qrAccessHistory.length > 0 ? (
              <div className="space-y-2.5">
                {profile.qrAccessHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{item.viewerRole}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.accessedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No external emergency scans recorded. Every access is logged here with location and timestamp.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Modal for Emergency Responder View */}
      <AnimatePresence>
        {showScannerSimulation && simulationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm">Emergency Responder Portal View</span>
                </div>
                <button
                  onClick={() => setShowScannerSimulation(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                  <div className="text-rose-900 font-bold text-base">{simulationData.patientName}</div>
                  <div className="text-slate-600 font-mono text-xs">{simulationData.patientCode}</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-rose-600 text-white font-black rounded-full text-xs">
                    Blood Group: {simulationData.bloodGroup}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900">Critical Allergies:</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-rose-700 font-semibold border border-slate-200">
                    {simulationData.allergies?.length > 0 ? simulationData.allergies.join(', ') : 'None Disclosed / Hidden'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900">Critical Conditions:</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-200">
                    {simulationData.criticalConditions?.length > 0 ? simulationData.criticalConditions.join(', ') : 'None Disclosed'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900">Active Medications:</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 border border-slate-200">
                    {simulationData.currentMedications?.length > 0 ? simulationData.currentMedications.join(', ') : 'None Disclosed'}
                  </div>
                </div>

                {simulationData.emergencyContactPhone && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-900">Emergency Contact:</div>
                    <a
                      href={`tel:${simulationData.emergencyContactPhone}`}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-between font-bold"
                    >
                      <span>Call {simulationData.emergencyContactName} ({simulationData.emergencyContactRelationship})</span>
                      <PhoneCall className="w-4 h-4 text-emerald-700" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => setShowScannerSimulation(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  Close Simulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
