import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Treatment } from '../../types';
import { Pill, Calendar, CheckCircle2, Clock, Hospital, User, AlertCircle } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '../common/ViewState';

export const TreatmentHistoryView: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const patientId = user?.patientData?.id || user?.id || 'pat-001';

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = () => {
    setLoading(true);
    setError(null);
    api
      .getTreatments(patientId)
      .then((data) => setTreatments(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError('Unable to load treatment history. Please retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTreatments();
  }, [patientId]);

  const filtered = (treatments || []).filter((t) => {
    if (filter === 'ALL') return true;
    const s = (t.status || '').toUpperCase();
    if (filter === 'ACTIVE') return s === 'ONGOING' || s === 'ACTIVE';
    if (filter === 'COMPLETED') return s === 'COMPLETED';
    return s === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>Prescription Regimens & Therapeutic History</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Treatment & Medication History</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Active and past pharmaceutical regimens, dosage frequencies, and duration intervals prescribed by your physicians.
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === f ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All Treatments' : f === 'ACTIVE' ? 'Active Regimens' : 'Completed Courses'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState
          message="Loading your treatment and prescription history..."
          subtext="Fetching active medications, dosage schedules, and past therapies."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load treatment history"
          message={error}
          onRetry={fetchTreatments}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No treatment records found"
          description={
            filter !== 'ALL'
              ? `There are no ${filter.toLowerCase()} treatment courses matching your active filter.`
              : "No pharmaceutical regimens or therapeutic courses have been recorded for your profile yet."
          }
          actionText="Take Clinical Case-Taking"
          onAction={() => setActiveTab('case_taking')}
          secondaryActionText={filter !== 'ALL' ? 'Show All Treatments' : undefined}
          onSecondaryAction={filter !== 'ALL' ? () => setFilter('ALL') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Course #{item.id}</span>
                    <h3 className="text-base font-bold text-slate-900">{item.treatmentName}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.status?.toUpperCase() === 'ACTIVE' || item.status === 'Ongoing'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Dosage</span>
                    <span className="font-semibold text-slate-800">{item.dosage || item.dosageInstructions || 'Standard course'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-semibold text-slate-800">
                      {item.startDate} to {item.endDate || 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Prescribing Physician</span>
                    <span className="font-semibold text-slate-800">{item.doctorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Hospital</span>
                    <span className="font-semibold text-slate-800">{item.hospitalName || 'Clinical Care Facility'}</span>
                  </div>

                  {item.notes && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Clinical Instructions:</span>
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified in medical records</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
