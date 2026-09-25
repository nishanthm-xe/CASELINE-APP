import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { ConsentRequest, AuditLog } from '../../types';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Hospital,
  AlertOctagon,
  Eye,
  FileText,
  Calendar,
  Shield,
  Search,
  Filter,
  Activity,
  Check,
} from 'lucide-react';

export const PrivacyConsentView: React.FC = () => {
  const { user, addToast, refreshNotifications, t } = useApp();
  const patient = user?.patientData;

  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveSection] = useState<'access_viewer' | 'requests' | 'system_logs'>('access_viewer');
  const [filterSearch, setFilterSearch] = useState('');

  const loadConsentData = async () => {
    const activePatientId = patient?.id || (user?.role === 'patient' ? user.id : 'pat-001');
    try {
      setLoading(true);
      const [reqs, logs] = await Promise.all([
        api.getConsentRequests({ patientId: activePatientId }),
        api.getAuditLogs(activePatientId),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentData();
  }, [patient]);

  const handleDecision = async (requestId: string, decision: 'GRANTED' | 'DENIED' | 'REVOKED') => {
    try {
      await api.respondConsent(requestId, decision);
      addToast(
        decision === 'GRANTED'
          ? 'Doctor access approved! Diagnostic reports unlocked.'
          : decision === 'DENIED'
          ? 'Doctor access request denied.'
          : 'Doctor access revoked immediately.',
        'info'
      );
      loadConsentData();
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingRequests = (requests || []).filter((r) => r.status === 'PENDING');
  const activeConsents = (requests || []).filter((r) => r.status === 'GRANTED');

  // Filter record access logs specifically for "Who Accessed My Records?"
  const recordAccessLogs = (auditLogs || []).filter((log) => {
    const isAccess =
      log.doctorName ||
      log.recordViewed ||
      log.action.toLowerCase().includes('view') ||
      log.action.toLowerCase().includes('read') ||
      log.action.toLowerCase().includes('access') ||
      log.userRole === 'doctor';
    if (!isAccess) return false;
    if (!filterSearch) return true;
    const q = filterSearch.toLowerCase();
    return (
      (log.doctorName || log.userName || '').toLowerCase().includes(q) ||
      (log.hospitalName || '').toLowerCase().includes(q) ||
      (log.recordViewed || log.resourceType || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>{t.privacyConsent || 'Privacy & Access Audit'}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              "Who Accessed My Records?" & Privacy Management
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Transparent, immutable audit logging of every doctor, hospital, and clinician access to your medical history.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('access_viewer')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'access_viewer'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Record Access History</span>
              <span className="ml-1 px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full text-[10px]">
                {recordAccessLogs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('requests')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Doctor Requests</span>
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('system_logs')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'system_logs'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: WHO ACCESSED MY RECORDS AUDIT VIEWER */}
      {activeTab === 'access_viewer' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Inspection Audit</h3>
                <p className="text-xs text-slate-500">Every clinician access creates an immutable record</p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Filter doctor, hospital, or report..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-teal-500"
              />
            </div>
          </div>

          {recordAccessLogs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <ShieldCheck className="w-10 h-10 text-teal-500 mx-auto opacity-60" />
              <h4 className="text-sm font-bold text-slate-800">No Record Access Logged Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Whenever a doctor or specialist views your biopsy or laboratory files, detailed inspection credentials appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordAccessLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div
                    key={log.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Doctor & Hospital Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                            <User className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {log.doctorName || log.userName || 'Attending Physician'}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                              <Hospital className="w-3.5 h-3.5 text-slate-400" />
                              <span>{log.hospitalName || 'Clinical Facility'}</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                          {log.permissionStatus || 'Patient Approved'}
                        </span>
                      </div>

                      {/* Detail specifications matching requirement */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Viewed:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {log.recordViewed || log.resourceType || 'Biopsy Report'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Date:</span>
                          <span className="font-medium text-slate-800">{formattedDate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Time:</span>
                          <span className="font-mono text-slate-800">{formattedTime}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Permission:</span>
                          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
                            <Check className="w-3 h-3 text-teal-600" />
                            {log.permissionStatus || 'Patient Approved'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Access:</span>
                          <span className="font-semibold text-slate-700">
                            {log.accessExpiry || 'Expires September 12, 2026'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details and IP footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Log ID: {log.id}</span>
                      <span>IP: {log.ipAddress || '103.22.140.18'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DOCTOR ACCESS REQUESTS & CONSENTS */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Pending Requests */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Pending Access Requests ({pendingRequests.length})
                </h3>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No pending requests. All practitioner requests have been responded to.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{req.doctorName}</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Target Resource: <strong className="text-amber-900">{req.resourceType}</strong>
                        </div>
                        {req.hospitalName && (
                          <div className="text-xs text-slate-500">{req.hospitalName}</div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        PENDING
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                        Reason: {req.reason}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Expires: {req.expiresAt ? req.expiresAt.split('T')[0] : '7 Days'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecision(req.id, 'DENIED')}
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, 'GRANTED')}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                        >
                          Allow Access
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Authorizations */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Active Doctor Authorizations ({activeConsents.length})
                </h3>
              </div>
            </div>

            {activeConsents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active doctor consents granted.
              </div>
            ) : (
              <div className="space-y-3">
                {activeConsents.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{req.doctorName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Resource: <strong className="text-teal-700">{req.resourceType}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Valid Until: {req.expiresAt ? req.expiresAt.split('T')[0] : 'Indefinite'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDecision(req.id, 'REVOKED')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: SYSTEM SECURITY LEDGER */}
      {activeTab === 'system_logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Immutable System Ledger</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Security Audit Logs</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {(auditLogs || []).map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                      {log.userRole}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{log.details}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span>Action: {log.action} | Resource: {log.resourceType || 'General'}</span>
                  <span>IP: {log.ipAddress || 'Internal'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
