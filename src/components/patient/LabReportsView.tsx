import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { LabReport } from '../../types';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Printer,
  Calendar,
  Hospital,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LoadingState, EmptyState, ErrorState } from '../common/ViewState';

export const LabReportsView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const patientId = user?.patientData?.id || user?.id || 'pat-001';

  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabReports = () => {
    setLoading(true);
    setError(null);
    api
      .getLabReports(patientId)
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        setLabReports(safeData);
        if (safeData.length > 0) setSelectedReport(safeData[0]);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load diagnostic laboratory reports. Please retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLabReports();
  }, [patientId]);

  const getStatusBadge = (status: string) => {
    if (status === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <ArrowUpRight className="w-3 h-3" /> High
        </span>
      );
    }
    if (status === 'LOW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <ArrowDownRight className="w-3 h-3" /> Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Normal
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 text-xs font-bold uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" />
            <span>Biochemical & Diagnostic Panels</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Diagnostic Laboratory Reports</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Complete blood counts, lipid profiles, and metabolic assays with automatic reference range benchmarking.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Panel</span>
        </button>
      </div>

      {loading ? (
        <LoadingState
          message="Loading your diagnostic laboratory panels..."
          subtext="Fetching biochemical assays, metabolic profiles, and verified parameters."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load diagnostic laboratory reports"
          message={error}
          onRetry={fetchLabReports}
        />
      ) : labReports.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No laboratory panels recorded yet"
          description="You do not have any diagnostic blood or metabolic panels registered in your clinical record."
          actionText="Scan & Upload Lab Report"
          onAction={() => setActiveTab('scan_document')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Test Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Recorded Panels ({labReports.length})
            </div>
            {(labReports || []).map((r) => {
              const isSelected = selectedReport?.id === r.id;
              const items = r.tests || r.results || [];
              const panelTitle = r.testCategory || r.testName || 'Diagnostic Panel';
              const abnormalCount = items.filter((res) => {
                const st = (res.status || '').toUpperCase();
                return st === 'HIGH' || st === 'LOW' || st === 'ABNORMAL';
              }).length;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-300 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{panelTitle}</h4>
                    <span className="text-xs font-mono text-slate-400">{r.reportDate}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Hospital className="w-3 h-3 text-slate-400" />
                    <span>{r.hospitalName}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">{items.length} Parameters</span>
                    {abnormalCount > 0 ? (
                      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {abnormalCount} Abnormal
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> All Normal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Parameter Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            {selectedReport ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedReport.testCategory || selectedReport.testName || 'Diagnostic Panel'}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Ordered by: <strong className="text-slate-800">{selectedReport.doctorName}</strong> • Facility: {selectedReport.hospitalName}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-600 px-3 py-1 bg-slate-100 rounded-xl">
                    {selectedReport.reportDate}
                  </div>
                </div>

                {/* Parameter Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-semibold">Investigation Parameter</th>
                        <th className="pb-3 font-semibold">Observed Value</th>
                        <th className="pb-3 font-semibold">Standard Unit</th>
                        <th className="pb-3 font-semibold">Biological Reference Range</th>
                        <th className="pb-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReport.tests || selectedReport.results || []).map((item, idx) => {
                        const paramName = item.testName || item.parameter || `Parameter #${idx + 1}`;
                        const val = item.result !== undefined ? item.result : item.value !== undefined ? item.value : '-';
                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 font-semibold text-slate-900">{paramName}</td>
                            <td className="py-3 font-mono font-bold text-slate-800">{val}</td>
                            <td className="py-3 text-slate-500 font-mono">{item.unit}</td>
                            <td className="py-3 text-slate-600 font-mono text-[11px]">{item.referenceRange}</td>
                            <td className="py-3 text-right">{getStatusBadge(item.status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified by Department of Clinical Pathology & Laboratory Medicine</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">Panel ID: {selectedReport.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a lab report to view parameters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
