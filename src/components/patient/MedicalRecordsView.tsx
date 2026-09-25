import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { MedicalRecord } from '../../types';
import {
  ClipboardList,
  Calendar,
  Hospital,
  User,
  HeartPulse,
  Activity,
  FileText,
  Search,
  Eye,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '../common/ViewState';

export const MedicalRecordsView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const patientId = user?.patientData?.id || user?.id || 'pat-001';

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = () => {
    setLoading(true);
    setError(null);
    api
      .getRecords(patientId)
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError('Unable to load clinical records. Please retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const filtered = (records || []).filter(
    (r) =>
      (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.diagnosis || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.doctorName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            <span>Outpatient & Inpatient Consultations</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Comprehensive Medical Records</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Doctor consultation notes, vital sign trends, differential diagnoses, and discharge summaries.
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-scan-document-action"
            type="button"
            onClick={() => setActiveTab('scan_document')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan / Import Document</span>
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records or diagnoses..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingState
          message="Loading your comprehensive medical records..."
          subtext="Fetching outpatient encounters, discharge summaries, and vital trends."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load medical records"
          message={error}
          onRetry={fetchRecords}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No consultation records found"
          description={
            search
              ? `No consultation records match your search query "${search}".`
              : "No doctor consultation notes or outpatient records have been recorded yet."
          }
          actionText="Take Clinical Case-Taking"
          onAction={() => setActiveTab('case_taking')}
          secondaryActionText={search ? 'Clear Search' : 'Scan Document'}
          onSecondaryAction={search ? () => setSearch('') : () => setActiveTab('scan_document')}
        />
      ) : (
        /* Grid of Medical Records */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Record #{record.id}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{record.title}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 font-mono">
                    {record.recordDate}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Consulting Doctor</span>
                    <span className="font-semibold text-slate-800">{record.doctorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Healthcare Center</span>
                    <span className="font-semibold text-slate-800">{record.hospitalName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Clinical Diagnosis</span>
                    <span className="font-bold text-teal-800">{record.diagnosis}</span>
                  </div>

                  {/* Vitals preview */}
                  {record.vitals && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 my-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                        <span>Vital Signs Recorded</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                          <div className="text-[10px] text-slate-400">BP</div>
                          <div className="font-bold text-slate-800">{record.vitals.bloodPressure}</div>
                        </div>
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                          <div className="text-[10px] text-slate-400">Pulse</div>
                          <div className="font-bold text-slate-800">{record.vitals.heartRate} bpm</div>
                        </div>
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                          <div className="text-[10px] text-slate-400">Temp</div>
                          <div className="font-bold text-slate-800">{record.vitals.temperature}</div>
                        </div>
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200/60">
                          <div className="text-[10px] text-slate-400">SpO2</div>
                          <div className="font-bold text-slate-800">{record.vitals.oxygenSaturation}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Physician Notes:</span>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed line-clamp-3">
                      {record.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Encounter</span>
                </span>
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>Inspect Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedRecord.title}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedRecord.recordDate}</div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="block text-slate-900 mb-1">Clinical Assessment & Plan:</strong>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedRecord.description}</p>
              </div>

              {selectedRecord.prescription && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <strong className="block text-teal-950 mb-1">Prescription Directives:</strong>
                  <p className="text-teal-900 font-mono text-[11px]">{selectedRecord.prescription}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
