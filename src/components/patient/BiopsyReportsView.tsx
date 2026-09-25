import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { BiopsyReport } from '../../types';
import {
  Microscope,
  FileText,
  ShieldCheck,
  Calendar,
  Hospital,
  User,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Printer,
  Download,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState, EmptyState, ErrorState } from '../common/ViewState';

export const BiopsyReportsView: React.FC = () => {
  const { user, addToast, setActiveTab } = useApp();
  const patient = user?.patientData;
  const patientId = patient?.id || user?.id || 'pat-001';

  const [reports, setReports] = useState<BiopsyReport[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<BiopsyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    setError(null);
    api
      .getBiopsyReports(patientId)
      .then((res) => {
        setReports(res.reports || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load biopsy records. Please check your connection and retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [patientId]);

  const filteredReports = (reports || []).filter((r) => {
    const diag = (r.diagnosis || '').toLowerCase();
    if (filter === 'all') return true;
    if (filter === 'benign') return diag.includes('benign');
    if (filter === 'malignant') return diag.includes('malignant') || diag.includes('carcinoma');
    return true;
  });

  const getDiagnosisBadge = (diag?: string) => {
    const d = (diag || '').toLowerCase();
    const isMalignant = d.includes('malignant') || d.includes('carcinoma');
    const isBenign = d.includes('benign');

    if (isMalignant) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          <span>Malignant</span>
        </span>
      );
    }
    if (isBenign) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Benign</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
        Diagnostic
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Microscope className="w-4 h-4" />
            <span>Histopathology Laboratory Records</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Biopsy & Pathology Reports</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified macroscopic, microscopic, and margins evaluations authorized by accredited pathologists.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'benign', label: 'Benign' },
            { id: 'malignant', label: 'Malignant' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === f.id ? 'bg-white text-indigo-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingState
          message="Loading your histopathology records..."
          subtext="Fetching biopsy reports, cellular margins, and pathologist verifications."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load biopsy records"
          message={error}
          onRetry={fetchReports}
        />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={Microscope}
          title="No biopsy records found"
          description={
            filter !== 'all'
              ? `There are no ${filter} biopsy records matching your active filter.`
              : "You do not have any histopathology examination records uploaded or logged yet."
          }
          actionText="Scan & Upload Biopsy Report"
          onAction={() => setActiveTab('scan_document')}
          secondaryActionText={filter !== 'all' ? 'Reset Filter' : undefined}
          onSecondaryAction={filter !== 'all' ? () => setFilter('all') : undefined}
        />
      ) : (
        /* Reports Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Specimen #{report.id}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{report.specimenDetails}</h3>
                </div>
                {getDiagnosisBadge(report.diagnosis)}
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Date of Examination</span>
                  <span className="font-semibold text-slate-800">{report.reportDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Pathologist</span>
                  <span className="font-semibold text-slate-800">{report.doctorName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Hospital / Lab</span>
                  <span className="font-semibold text-slate-800">{report.hospitalName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Surgical Margins</span>
                  <span className={`font-bold ${report.margins.includes('Clear') ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {report.margins}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Diagnosis Summary:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-800 font-medium leading-relaxed">
                    {report.diagnosis}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Consent Enforced</span>
              </span>
              <button
                onClick={() => setSelectedReport(report)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>View Full Biopsy Report</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Full Biopsy Document Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden relative my-6"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Microscope className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                      Official Histopathology Report
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 text-white">{selectedReport.specimenDetails}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Specimen Ref: {selectedReport.id} • {selectedReport.reportDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs text-slate-700">
                {/* Patient & Practitioner Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patient Name</span>
                    <strong className="text-slate-900">{patient?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Patient ID</span>
                    <strong className="text-slate-900 font-mono">{patient?.patientCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reporting Pathologist</span>
                    <strong className="text-slate-900">{selectedReport.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Facility</span>
                    <strong className="text-slate-900">{selectedReport.hospitalName}</strong>
                  </div>
                </div>

                {/* Clinical Indication */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Clinical History & Indication
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {selectedReport.clinicalHistory}
                  </p>
                </div>

                {/* Macroscopic Description */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Macroscopic (Gross) Examination
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {selectedReport.macroscopic}
                  </p>
                </div>

                {/* Microscopic Description */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Microscopic (Histopathological) Findings
                  </h4>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.microscopic}
                  </p>
                </div>

                {/* Definitive Diagnosis & Margins */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                      Definitive Pathological Diagnosis
                    </span>
                    {getDiagnosisBadge(selectedReport.diagnosis)}
                  </div>
                  <div className="text-sm font-bold text-indigo-900 leading-relaxed">
                    {selectedReport.diagnosis}
                  </div>
                  <div className="text-xs text-indigo-800 pt-1 border-t border-indigo-200/60">
                    Surgical Margin Status: <strong>{selectedReport.margins}</strong>
                  </div>
                </div>

                {/* Sign-off */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Digitally Authenticated Histopathology Certificate</span>
                  </div>
                  <div>Report Date: {selectedReport.reportDate}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
