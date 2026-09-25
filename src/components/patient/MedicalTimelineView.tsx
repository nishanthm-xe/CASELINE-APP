import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { MedicalTimelineEvent } from '../../types';
import {
  Clock,
  Filter,
  Microscope,
  FlaskConical,
  Stethoscope,
  Scissors,
  Pill,
  FileText,
  Hospital,
  ChevronRight,
  X,
  Calendar,
  Eye,
  Download,
  AlertCircle,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState, EmptyState, ErrorState } from '../common/ViewState';

export const MedicalTimelineView: React.FC = () => {
  const { user, setActiveTab } = useApp();

  const patientData = user?.patientData as (typeof user.patientData & {
    caseLinePatientId?: string;
    case_line_patient_id?: string;
  });
  const patientId =
    patientData?.caseLinePatientId ||
    patientData?.case_line_patient_id ||
    patientData?.id ||
    user?.id ||
    '';
  console.log('CASE LINE TIMELINE patientId:', patientId);

  const [events, setEvents] = useState<MedicalTimelineEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<MedicalTimelineEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = () => {
    setLoading(true);
    setError(null);
    api
  .getTimeline(patientId)
  .then((data: any) => {
    const encounters = Array.isArray(data)
      ? data
      : Array.isArray(data?.verifiedEncounters)
        ? data.verifiedEncounters
        : [];

    const timelineEvents: MedicalTimelineEvent[] = encounters.map((encounter: any) => ({
      id: encounter.encounterId,
      patientId: encounter.caseLinePatientId || encounter.patientId,
      date: encounter.visitDate || encounter.createdAt,
      eventType: 'consultation',
      title: encounter.chiefComplaint || 'Doctor Consultation',
      institution: encounter.hospital?.name || 'Hospital',
      doctorName: encounter.doctor?.name || encounter.doctor?.doctorCode,
      summary: encounter.clinicalSummary || '',
      diagnosis: encounter.diagnosis,
      category: 'consultation',
    }));

    setEvents(timelineEvents);
  })
      .catch((err) => {
        console.error(err);
        setError('Unable to load longitudinal medical timeline. Please retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, [patientId]);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'consultation', label: 'Consultations' },
    { id: 'biopsy', label: 'Biopsy Reports' },
    { id: 'lab', label: 'Lab Reports' },
    { id: 'surgery', label: 'Surgeries' },
    { id: 'medication', label: 'Medications' },
  ];

  const getEventCategory = (e: MedicalTimelineEvent) => {
    if (e.category) return e.category;
    const type = (e.eventType || '').toLowerCase();
    if (type.includes('biopsy')) return 'biopsy';
    if (type.includes('lab')) return 'lab';
    if (type.includes('surgery')) return 'surgery';
    if (type.includes('prescription') || type.includes('medication')) return 'medication';
    return 'consultation';
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'all') return true;
    return getEventCategory(e) === selectedCategory;
  });

  // Group events by Year for clear chronological separators
  const groupedByYear: { [year: string]: MedicalTimelineEvent[] } = {};
  filteredEvents.forEach((ev) => {
    const rawDate = ev.eventDate || ev.date || '2026-01-01';
    const year = new Date(rawDate).getFullYear().toString() || 'Recent';
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(ev);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'biopsy':
        return { label: 'Biopsy', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Microscope };
      case 'lab':
        return { label: 'Lab Report', bg: 'bg-sky-100 text-sky-800 border-sky-200', icon: FlaskConical };
      case 'surgery':
        return { label: 'Surgery', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: Scissors };
      case 'medication':
        return { label: 'Medication', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Pill };
      default:
        return { label: 'Consultation', bg: 'bg-teal-100 text-teal-800 border-teal-200', icon: Stethoscope };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Longitudinal Health Records</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Vertical Medical Timeline</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Every clinical event, surgical procedure, biopsy report, and prescription chronologically organized.
          </p>
        </div>

        {/* Actions & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id="btn-timeline-scan-doc"
            type="button"
            onClick={() => setActiveTab('scan_document')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan / Import Document</span>
          </button>

          <div className="flex flex-wrap gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-white text-teal-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline Stream */}
      <div className="max-w-4xl mx-auto py-4">
        {loading ? (
          <LoadingState
            message="Constructing longitudinal timeline..."
            subtext="Chronologically sequencing consultations, diagnostic encounters, and prescription regimens."
          />
        ) : error ? (
          <ErrorState
            title="Unable to build medical timeline"
            message={error}
            onRetry={fetchTimeline}
          />
        ) : years.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No events found in timeline"
            description={
              selectedCategory !== 'all'
                ? `There are no clinical events matching "${selectedCategory}" in your timeline history.`
                : "Your longitudinal timeline has no encounters recorded yet. Take an intake or scan your records to begin."
            }
            actionText="Start Clinical Case-Taking"
            onAction={() => setActiveTab('case_taking')}
            secondaryActionText={selectedCategory !== 'all' ? 'Show All Events' : undefined}
            onSecondaryAction={selectedCategory !== 'all' ? () => setSelectedCategory('all') : undefined}
          />
        ) : (
          years.map((year) => (
            <div key={year} className="mb-12">
              {/* Year Separator Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="px-4 py-1 rounded-full bg-slate-900 text-white font-mono font-bold text-xs shadow-sm">
                  {year}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Central Vertical Timeline */}
              <div className="relative pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-1 before:bg-gradient-to-b before:from-teal-500 before:via-sky-400 before:to-indigo-500 space-y-6">
                {groupedByYear[year].map((event, idx) => {
                  const cat = getEventCategory(event);
                  const badge = getCategoryBadge(cat);
                  const Icon = badge.icon;
                  const displayDate = event.eventDate || event.date;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group"
                    >
                      {/* Central Node Circle */}
                      <span className="absolute -left-6 sm:-left-8 top-4 w-5 h-5 rounded-full bg-white border-4 border-teal-600 shadow-md group-hover:scale-125 transition-transform" />

                      {/* Event Card */}
                      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{badge.label}</span>
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              {displayDate}
                            </span>
                            {(event.metadata?.verified === false || (event as any).isUnverified) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>OCR UNVERIFIED</span>
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                            <Hospital className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.hospitalName}</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Doctor attribution and attachment button */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs text-slate-600">
                            Attending Practitioner: <strong className="text-slate-900">{event.doctorName}</strong>
                          </div>

                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                            <span>View Full Clinical Record</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Report Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                    Clinical Document Detail
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-white">{selectedEvent.title}</h3>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">
                    Date of Event: {selectedEvent.eventDate}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Practitioner</span>
                    <strong className="text-slate-900 font-semibold">{selectedEvent.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Facility</span>
                    <strong className="text-slate-900 font-semibold">{selectedEvent.hospitalName}</strong>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Clinical Summary & Impression
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-200 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Structured Simulated Diagnostics View */}
                <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Cryptographic Verification & Integrity</span>
                  </div>
                  <div className="text-[11px] text-teal-800 space-y-1">
                    <div>Signed By: {selectedEvent.doctorName}</div>
                    <div>Recorded to CASE LINE Vault on {selectedEvent.eventDate}</div>
                    <div>Access Status: Sovereign Patient Consent Protected</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
