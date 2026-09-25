import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Patient, ConsentRequest } from '../../types';
import {
  Lock,
  PlusCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Sparkles,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  FileText,
} from 'lucide-react';

interface DoctorConsentManagementViewProps {
  searchResults: Patient[];
  consentRequests: ConsentRequest[];
  loadingConsents: boolean;
  onRefreshConsents: () => void;
  onViewPatientRecords: (patient: Patient) => void;
  onOpenCaseSummary: (patient: Patient) => void;
  onOpenAccessModal: (patient?: Patient) => void;
}

export const DoctorConsentManagementView: React.FC<DoctorConsentManagementViewProps> = ({
  searchResults,
  consentRequests,
  loadingConsents,
  onRefreshConsents,
  onViewPatientRecords,
  onOpenCaseSummary,
  onOpenAccessModal,
}) => {
  const { addToast } = useApp();
  const [filterTab, setFilterTab] = useState<'ALL' | 'GRANTED' | 'PENDING' | 'REVOKED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      await api.cancelConsentRequest(requestId);
      addToast('Consent access request withdrawn.', 'info');
      onRefreshConsents();
    } catch (e: any) {
      addToast(e.message || 'Failed to cancel consent request', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDemoApprove = async (requestId: string, patientName: string) => {
    setApprovingId(requestId);
    try {
      await api.demoApproveConsent(requestId);
      addToast(`[Demo Mode] Consent granted for ${patientName}! EHR records unlocked.`, 'success');
      onRefreshConsents();
    } catch (e: any) {
      addToast(e.message || 'Failed to approve consent', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const filteredRequests = consentRequests.filter((req) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'GRANTED') return req.status === 'GRANTED';
    if (filterTab === 'PENDING') return req.status === 'PENDING';
    if (filterTab === 'REVOKED') return req.status === 'REVOKED' || req.status === 'DENIED';
    return true;
  });

  const grantedCount = consentRequests.filter((r) => r.status === 'GRANTED').length;
  const pendingCount = consentRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">ABDM Clinical Consent & Data Access</h2>
            <p className="text-xs text-slate-500">
              National Digital Health Mission (NDHM) compliant patient access authorizations with cryptographic audit log.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAccessModal()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-teal-400" />
          <span>Request New Consent</span>
        </button>
      </div>

      {/* Stats and Filter Chips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({consentRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('GRANTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'GRANTED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:bg-white/50'
            }`}
          >
            Active Consents ({grantedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === 'PENDING' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-700 hover:bg-white/50'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Auto-expiring cryptographic tokens enforced</span>
        </div>
      </div>

      {/* Requests List */}
      {loadingConsents ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Synchronizing ABDM consent registry...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/90 space-y-3">
          <Lock className="w-10 h-10 mx-auto text-slate-300" />
          <p>No consent requests in "{filterTab.toLowerCase()}". Use "Request New Consent" to initiate access.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const patient = searchResults.find((p) => p.id === req.patientId);
            const isGranted = req.status === 'GRANTED';
            const isPending = req.status === 'PENDING';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-3xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isGranted
                    ? 'border-emerald-200 hover:border-emerald-300 shadow-2xs'
                    : isPending
                    ? 'border-amber-200 hover:border-amber-300 bg-amber-50/20 shadow-2xs'
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{req.patientName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({req.patientCode})</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isGranted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <strong className="text-slate-700">Scope:</strong> {req.resourceType}
                    </div>
                    <div>
                      <strong className="text-slate-700">Purpose:</strong> {req.reason}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                    {req.expiresAt && <span>• Valid Until: {new Date(req.expiresAt).toLocaleDateString()}</span>}
                    <span>• ABDM Consent Artifact ID: {req.id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isGranted && patient && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenCaseSummary(patient)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Case Docket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onViewPatientRecords(patient)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open EHR</span>
                      </button>
                    </>
                  )}

                  {isPending && (
                    <>
                      {/* Demo Instant Approve Button */}
                      <button
                        type="button"
                        disabled={approvingId === req.id}
                        onClick={() => handleDemoApprove(req.id, req.patientName)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                        title="Instantly grant consent for evaluation/demo purposes"
                      >
                        {approvingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Instant Approve (Demo)</span>
                      </button>

                      <button
                        type="button"
                        disabled={cancellingId === req.id}
                        onClick={() => handleCancelRequest(req.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                      >
                        {cancellingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Withdraw Request</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
