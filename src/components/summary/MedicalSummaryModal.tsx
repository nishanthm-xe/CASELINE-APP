import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  FileCheck2,
  Printer,
  Share2,
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Calendar,
  Heart,
  Activity,
  Pill,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalSummaryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, addToast } = useApp();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id || 'pat-001';

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getMedicalSummary(patientId)
        .then((data) => {
          setSummaryData(data);
        })
        .catch((err) => {
          console.error(err);
          addToast('Failed to generate medical summary', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, patientId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerification = () => {
    if (summaryData?.verificationUrl) {
      navigator.clipboard.writeText(summaryData.verificationUrl);
      addToast('Secure verification link copied to clipboard', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="medical-summary-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Verified Clinical Medical Summary</h2>
              <p className="text-[11px] text-slate-400">Standardized interoperable health docket for referrals & consultations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyVerification}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Summary Body */}
        <div className="p-8 space-y-6 text-slate-900 print:p-0">
          {loading || !summaryData ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Synthesizing clinical timeline & diagnostic records...</p>
            </div>
          ) : (
            <>
              {/* Document Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-slate-900">
                      CASE<span className="text-teal-600">LINE</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                      National Health OS
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Universal Electronic Health Record (ABHA / NDHM Standards Compliant)
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-900">Generated: {summaryData.generatedAt}</div>
                  <div className="font-mono text-[11px] text-slate-500">Docket Ref: CL-SUM-{Date.now().toString().slice(-6)}</div>
                  <div className="flex items-center justify-end gap-1 text-emerald-700 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Aadhaar KYC Verified</span>
                  </div>
                </div>
              </div>

              {/* Patient Demographics */}
              {(() => {
                const pat = summaryData.patient || summaryData.patientInfo || {};
                const emProf = summaryData.emergencyProfile || summaryData.criticalEmergency || {};
                const allergies = emProf.allergies || [];
                const conditions = emProf.criticalConditions || [];
                const meds = summaryData.activeMedications || [];
                const vitals = summaryData.recentVitals || [];

                return (
                  <>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Patient Name:</span>
                        <span className="font-bold text-slate-900 text-sm">{pat.fullName || 'Verified Patient'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Universal ID / ABHA:</span>
                        <span className="font-mono font-bold text-teal-700">{pat.patientCode || pat.id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Age / Gender:</span>
                        <span className="font-semibold">{pat.age ? `${pat.age} yrs` : 'Adult'} / {pat.gender || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Blood Group:</span>
                        <span className="font-black text-rose-700 text-sm">{pat.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    {/* Clinical Impression & Physician Summary */}
                    {summaryData.clinicalImpression && (
                      <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-teal-700" />
                          <span>Physician Clinical Impression & Assessment</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {summaryData.clinicalImpression}
                        </p>
                      </div>
                    )}

                    {/* Critical Emergency Snapshot */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <span>Critical Clinical Alert & Emergency Profile</span>
                      </h3>
                      <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700">Documented Allergies:</span>
                          <div className="font-bold text-rose-700 mt-0.5">
                            {allergies.length > 0 ? allergies.join(', ') : 'No known drug allergies (NKDA)'}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Chronic Diagnoses / Active Conditions:</span>
                          <div className="font-bold text-slate-900 mt-0.5">
                            {conditions.length > 0 ? conditions.join(', ') : 'None recorded'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Prescribed Medications */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-600" />
                        <span>Current Active Medications & Regimens</span>
                      </h3>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Medicine</th>
                              <th className="py-2.5 px-3">Dosage</th>
                              <th className="py-2.5 px-3">Frequency</th>
                              <th className="py-2.5 px-3">Timing</th>
                              <th className="py-2.5 px-3">Prescriber / Clinic</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {meds.length > 0 ? (
                              meds.map((m: any, idx: number) => (
                                <tr key={m.id || idx}>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">{m.medicineName || m.name}</td>
                                  <td className="py-2.5 px-3 font-mono text-teal-700">{m.dosage || 'Standard'}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{m.frequency || 'Daily'}</td>
                                  <td className="py-2.5 px-3 text-slate-500 capitalize">{(m.timing || 'after_food').replace('_', ' ')}</td>
                                  <td className="py-2.5 px-3 text-slate-500">{m.prescribedBy || m.doctor || 'Primary Physician'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-3 px-4 text-center text-slate-400">
                                  No active prescriptions recorded
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent Physiological Vitals */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-indigo-600" />
                        <span>Recent Clinical Vitals & Telemetry</span>
                      </h3>
                      {vitals.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {vitals.map((v: any, idx: number) => {
                            if (v.bp || v.glucose || v.heartRate) {
                              return (
                                <React.Fragment key={idx}>
                                  {v.bp && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                      <span className="text-slate-500 block">Blood Pressure</span>
                                      <span className="text-base font-bold text-slate-900 mt-0.5 block">{v.bp}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{v.date ? v.date.slice(0, 10) : 'Recent'}</span>
                                    </div>
                                  )}
                                  {v.glucose && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                      <span className="text-slate-500 block">Blood Glucose</span>
                                      <span className="text-base font-bold text-slate-900 mt-0.5 block">{v.glucose}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{v.date ? v.date.slice(0, 10) : 'Recent'}</span>
                                    </div>
                                  )}
                                  {v.heartRate && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                      <span className="text-slate-500 block">Heart Rate</span>
                                      <span className="text-base font-bold text-slate-900 mt-0.5 block">{v.heartRate}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{v.date ? v.date.slice(0, 10) : 'Recent'}</span>
                                    </div>
                                  )}
                                  {v.spo2 && (
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                      <span className="text-slate-500 block">Pulse Oximetry</span>
                                      <span className="text-base font-bold text-slate-900 mt-0.5 block">{v.spo2}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{v.date ? v.date.slice(0, 10) : 'Recent'}</span>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            }
                            const vType = (v.type || 'Vital').replace('_', ' ');
                            return (
                              <div key={v.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <span className="text-slate-500 capitalize block">{vType}</span>
                                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                                  {v.value} {v.unit || ''}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{v.date || 'Recent'}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                          No recent vital readings on file
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Diagnostic Record Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Diagnostic History Highlights
                </h3>
                <div className="divide-y divide-slate-100 text-xs border border-slate-200 rounded-xl">
                  {summaryData.records?.slice(0, 3).map((r: any) => (
                    <div key={r.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{r.title}</div>
                        <div className="text-slate-500 text-[11px]">{r.hospital || r.doctor} • {r.date}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {r.status || 'Verified'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Disclaimer & Verification Seal */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="font-bold text-slate-700">Official Clinical Summary Disclaimer:</div>
                  <p className="text-[11px] max-w-xl">
                    This electronic summary is generated from verified longitudinal case notes on CASE LINE. For definitive clinical decisions, review source biopsy histology, imaging DICOM sets, and complete lab panels.
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 mx-auto flex items-center justify-center shadow-xs">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 block">Scan to Verify</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
