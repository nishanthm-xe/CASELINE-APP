import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Patient, Appointment } from '../../types';
import {
  Stethoscope,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  PlusCircle,
  FileText,
  Upload,
  ScanLine,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  X,
  Loader2,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorDashboardViewProps {
  searchResults: Patient[];
  consentStatuses: { [patientId: string]: string };
  appointments: Appointment[];
  loadingAppointments: boolean;
  docAvailability: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE';
  updatingAvailability: boolean;
  onUpdateAvailability: (status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE') => Promise<void>;
  onOpenCaseSummary: (patient: Patient) => void;
  onViewPatientRecords: (patient: Patient) => void;
  onSelectPatientForRecord: (patient: Patient) => void;
  onSelectPatientForAccess: (patient: Patient) => void;
  onRefreshAppointments: () => void;
  onOpenPrescriptionBuilder?: (patient?: Patient) => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  searchResults,
  consentStatuses,
  appointments,
  loadingAppointments,
  docAvailability,
  updatingAvailability,
  onUpdateAvailability,
  onOpenCaseSummary,
  onViewPatientRecords,
  onSelectPatientForRecord,
  onSelectPatientForAccess,
  onRefreshAppointments,
  onOpenPrescriptionBuilder,
}) => {
  const { user, addToast, setActiveTab } = useApp();
  const doctor = user?.doctorData;

  // Appointment actions state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('Physician schedule adjustment');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Clinician emergency duty / OT procedure');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const [filterAptStatus, setFilterAptStatus] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const consentedCount = Object.values(consentStatuses).filter((s) => s === 'GRANTED').length;
  const pendingCount = Object.values(consentStatuses).filter((s) => s === 'PENDING').length;

  const handleMarkCompleted = async (apt: Appointment) => {
    try {
      await api.updateAppointmentStatus(apt.id, 'Completed');
      addToast(`Consultation with ${apt.patientName} marked as Completed.`, 'success');
      onRefreshAppointments();
    } catch (e: any) {
      addToast(e.message || 'Failed to update consultation status', 'error');
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApt || !rescheduleDate || !rescheduleTime) {
      addToast('Please specify a valid date and time slot.', 'error');
      return;
    }
    setSubmittingReschedule(true);
    try {
      await api.rescheduleAppointment(reschedulingApt.id, `${rescheduleDate}T${rescheduleTime}:00`, rescheduleReason);
      addToast(`Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}. Patient notified.`, 'success');
      setReschedulingApt(null);
      onRefreshAppointments();
    } catch (e: any) {
      addToast(e.message || 'Failed to reschedule appointment', 'error');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingApt) return;
    setSubmittingCancel(true);
    try {
      await api.cancelAppointment(cancellingApt.id, cancelReason);
      addToast(`Appointment cancelled. Patient notification dispatched.`, 'info');
      setCancellingApt(null);
      onRefreshAppointments();
    } catch (e: any) {
      addToast(e.message || 'Failed to cancel appointment', 'error');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterAptStatus === 'ALL') return true;
    if (filterAptStatus === 'SCHEDULED') return a.status?.toLowerCase() === 'scheduled' || a.status?.toLowerCase() === 'confirmed';
    if (filterAptStatus === 'COMPLETED') return a.status?.toLowerCase() === 'completed';
    if (filterAptStatus === 'CANCELLED') return a.status?.toLowerCase() === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Clinician Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-start sm:items-center gap-4">
          <img
            src={doctor?.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
            alt={doctor?.fullName || 'Attending Physician'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md shrink-0"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Certified Attending Clinician</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{doctor?.fullName || 'Dr. Priya Ramanathan, MD'}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {doctor?.specialization || 'Oncology & Internal Medicine'} • {doctor?.hospitalName || 'Apollo Memorial Hospital'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-teal-300 font-mono mt-1.5">
              <span>NMC/MCI Reg: {doctor?.registrationNumber || 'MCI-KA-2014-88910'}</span>
              <span>•</span>
              <span>Code: {doctor?.doctorCode || 'DR-000001'}</span>
            </div>
          </div>
        </div>

        {/* Live OPD Availability Pill Toggle */}
        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
            Live Clinical Availability
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
            <button
              type="button"
              disabled={updatingAvailability}
              onClick={() => onUpdateAvailability('AVAILABLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                docAvailability === 'AVAILABLE'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Available
            </button>
            <button
              type="button"
              disabled={updatingAvailability}
              onClick={() => onUpdateAvailability('IN_CONSULTATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                docAvailability === 'IN_CONSULTATION'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              In Consult
            </button>
            <button
              type="button"
              disabled={updatingAvailability}
              onClick={() => onUpdateAvailability('ON_LEAVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                docAvailability === 'ON_LEAVE'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300"></span>
              On Leave
            </button>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab('appointments')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's OPD</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{appointments.length}</span>
            <span className="text-[11px] text-teal-600 font-semibold">Consultations</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Click to open schedule →</span>
        </div>

        <div
          onClick={() => setActiveTab('records')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Consented EHR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">{consentedCount}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Active Access</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ABDM compliant access →</span>
        </div>

        <div
          onClick={() => setActiveTab('consent')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Consents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700">{pendingCount}</span>
            <span className="text-[11px] text-amber-600 font-semibold">Awaiting patient</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Review authorizations →</span>
        </div>

        <div
          onClick={() => setActiveTab('upload')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Diagnostic Files</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700">18+</span>
            <span className="text-[11px] text-indigo-600 font-semibold">Biopsy & Labs</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Upload or OCR report →</span>
        </div>

        <div
          onClick={() => setActiveTab('analytics')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-400 hover:shadow-xs transition cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Saved</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">~15m</span>
            <span className="text-[11px] text-purple-600 font-semibold">Per patient docket</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">View practice analytics →</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Clinical Quick Actions:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-teal-400" />
            <span>Search Patient</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenPrescriptionBuilder) {
                const firstConsented = searchResults.find((p) => consentStatuses[p.id] === 'GRANTED');
                onOpenPrescriptionBuilder(firstConsented);
              } else {
                setActiveTab('prescriptions');
              }
            }}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Prescription</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan_document')}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ScanLine className="w-3.5 h-3.5 text-purple-600" />
            <span>Scan Document</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('availability')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-600" />
            <span>OPD Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Consultations Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Today's Outpatient Queue</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Manage attending patients, review AI clinical intake dockets, and record prescriptions.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterAptStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      filterAptStatus === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st === 'SCHEDULED' ? 'Upcoming' : st === 'COMPLETED' ? 'Done' : 'Cancelled'}
                  </button>
                ))}
              </div>
            </div>

            {loadingAppointments ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span>Synchronizing consultation calendar...</span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                <p>No consultations matching "{filterAptStatus.toLowerCase()}" in today's OPD schedule.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredAppointments.map((appt) => {
                  const patient = searchResults.find(
                    (p) => p.id === appt.patientId || p.patientCode === appt.patientCode || p.id === 'pat-001'
                  );
                  const isConsented = patient && consentStatuses[patient.id] === 'GRANTED';
                  const isDone = appt.status?.toLowerCase() === 'completed';
                  const isCancelled = appt.status?.toLowerCase() === 'cancelled';

                  return (
                    <div
                      key={appt.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200 opacity-80'
                          : isCancelled
                          ? 'bg-rose-50/30 border-rose-200/80 opacity-75'
                          : 'bg-white border-slate-200/90 hover:border-teal-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-100">
                            {appt.patientName?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">{appt.patientName}</h3>
                              <span className="text-[10px] font-mono text-slate-400">({appt.patientCode || 'PT-000001'})</span>
                              {isConsented && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>CONSENTED</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-teal-600" />
                                {appt.appointmentDate || (appt as any).date || 'Today'} • {appt.appointmentTime || (appt as any).timeSlot || (appt as any).time || '10:30 AM'}
                              </span>
                              <span>•</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-600">
                                {appt.type ? appt.type.replace('_', ' ') : 'In-Person OPD'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center border ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {appt.status?.toUpperCase() || 'SCHEDULED'}
                        </span>
                      </div>

                      <div className="py-2.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Presenting Indication:</span>{' '}
                        {appt.reason || 'Follow-up consultation, symptom evaluation, and medication review.'}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100">
                        {patient && (
                          <button
                            type="button"
                            onClick={() => onOpenCaseSummary(patient)}
                            className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>Case Docket</span>
                          </button>
                        )}

                        {patient && isConsented && (
                          <button
                            type="button"
                            onClick={() => onViewPatientRecords(patient)}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Full EHR</span>
                          </button>
                        )}

                        {!isDone && !isCancelled && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenPrescriptionBuilder) {
                                  onOpenPrescriptionBuilder(patient);
                                } else if (patient) {
                                  onSelectPatientForRecord(patient);
                                }
                              }}
                              className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>Start Consult / Rx</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(appt)}
                              className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                              title="Mark this consultation as finished"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Done</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingApt(appt);
                                setRescheduleDate(appt.appointmentDate || (appt as any).date || new Date().toISOString().split('T')[0]);
                                setRescheduleTime(appt.appointmentTime || (appt as any).timeSlot || (appt as any).time || '11:00 AM');
                              }}
                              className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-medium transition"
                            >
                              Reschedule
                            </button>

                            <button
                              type="button"
                              onClick={() => setCancellingApt(appt)}
                              className="py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition"
                            >
                              Cancel
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
        </div>

        {/* Right 1 Col: Quick Patient Access & Activity Stream */}
        <div className="space-y-4">
          {/* Consented Patients Quick List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Consented Files</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="text-xs text-teal-600 font-bold hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {searchResults
                .filter((p) => consentStatuses[p.id] === 'GRANTED')
                .slice(0, 4)
                .map((pat) => (
                  <div
                    key={pat.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-teal-50/50 hover:border-teal-200 transition flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{pat.fullName}</div>
                      <div className="text-[10px] text-slate-500">
                        {pat.patientCode} • {pat.age}Y • <span className="text-rose-600 font-bold">{pat.bloodGroup}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCaseSummary(pat)}
                        className="p-1.5 bg-white hover:bg-teal-100 text-teal-800 border border-slate-200 rounded-lg text-[10px] font-bold transition shadow-2xs"
                        title="View Case Docket"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewPatientRecords(pat)}
                        className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                        title="View Full EHR"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {searchResults.filter((p) => consentStatuses[p.id] === 'GRANTED').length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No active consent authorizations found. Request patient access in the Patient Directory.
                </div>
              )}
            </div>
          </div>

          {/* Clinical Feed & Safety Alerts */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Live Patient Activity</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">ABDM Consent Granted</div>
                  <div className="text-emerald-700 text-[11px] mt-0.5">
                    Patient Rajesh Sharma authorized full EHR surveillance for 30 days.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-start gap-2.5">
                <Upload className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-900">New Pathology Ingested</div>
                  <div className="text-indigo-700 text-[11px] mt-0.5">
                    Core needle biopsy report attached to timeline with clear surgical margins.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900">Clinical Red Flag Alert</div>
                  <div className="text-amber-700 text-[11px] mt-0.5">
                    HbA1c &gt; 9.4% in latest metabolic panel. Medication review recommended.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {reschedulingApt && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Reschedule Consultation</h3>
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmReschedule} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Patient</label>
                  <input
                    type="text"
                    disabled
                    value={`${reschedulingApt.patientName} (${reschedulingApt.patientCode || 'PT-000001'})`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">New Date</label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Time Slot</label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                      <option value="12:00 PM">12:00 PM - 12:30 PM</option>
                      <option value="02:30 PM">02:30 PM - 03:00 PM</option>
                      <option value="04:30 PM">04:30 PM - 05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reason for Reschedule</label>
                  <input
                    type="text"
                    required
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20"
                    placeholder="e.g. Schedule adjustment or emergency duty"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReschedulingApt(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReschedule}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {submittingReschedule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Consultation Modal */}
      <AnimatePresence>
        {cancellingApt && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Cancel Consultation</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCancellingApt(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Are you sure you want to cancel the scheduled consultation for{' '}
                  <strong className="text-slate-900">{cancellingApt.patientName}</strong>? The patient will be notified via SMS and in-app message.
                </p>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cancellation Reason</label>
                  <textarea
                    rows={2}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                    placeholder="e.g. Attending clinician called into emergency surgery"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCancellingApt(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCancel}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    {submittingCancel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
