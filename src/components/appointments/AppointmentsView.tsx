import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  Building,
  User,
  Plus,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  MapPin,
  CalendarCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState } from '../common/ViewState';

export const AppointmentsView: React.FC = () => {
  const { user, addToast, t } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('11:00 AM');

  // Booking Form State
  const [booking, setBooking] = useState({
    doctorId: 'doc-001',
    doctorName: 'Dr. Priya Ramanathan, MD',
    specialty: 'Endocrinology & Internal Medicine',
    hospitalName: 'Apollo Memorial Hospital, Jayanagar',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    appointmentTime: '10:30 AM',
    type: 'in_person' as 'in_person' | 'video' | 'followup',
    reason: 'Routine quarterly diabetes and hypertension follow-up evaluation.',
  });

  const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id || 'pat-001';

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointments({ patientId });
      setAppointments(data || []);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  const handleCreateAppointment = async () => {
    try {
      await api.createAppointment({
        patientId,
        patientName: user?.fullName || 'Rajesh Sharma',
        patientPhone: user?.phoneNumber || user?.phone || '+91 98765 43210',
        doctorId: booking.doctorId,
        doctorName: booking.doctorName,
        specialty: booking.specialty,
        hospitalName: booking.hospitalName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        type: booking.type,
        reason: booking.reason,
      });

      setShowBookModal(false);
      await loadAppointments();
      addToast('Appointment scheduled successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to book appointment', 'error');
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleAppt || !newRescheduleDate) return;
    try {
      await api.updateAppointment(rescheduleAppt.id, {
        appointmentDate: newRescheduleDate,
        appointmentTime: newRescheduleTime,
        status: 'confirmed',
      });
      setRescheduleAppt(null);
      await loadAppointments();
      addToast('Appointment rescheduled and confirmed', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to reschedule appointment', 'error');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await api.cancelAppointment(id);
      await loadAppointments();
      addToast('Appointment cancelled', 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel appointment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Checking clinical calendars & slots...</p>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => {
    const s = a.status?.toLowerCase();
    return s === 'confirmed' || s === 'pending' || s === 'scheduled';
  });
  const past = appointments.filter((a) => {
    const s = a.status?.toLowerCase();
    return s === 'completed' || s === 'cancelled' || s === 'no-show';
  });

  if (loading) {
    return (
      <LoadingState
        message="Loading your scheduled appointments..."
        subtext="Fetching consultation slots, teleconsultation links, and hospital visit records."
      />
    );
  }

  return (
    <div id="appointments-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.appointmentBooking}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital visits, teleconsultations, instant reschedule workflows, and verified doctor slots.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Upcoming Consultations</h2>
          <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
            {upcoming.length} Active
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            No upcoming consultations scheduled. Click "Book New Consultation" to set up an appointment.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div
                key={appt.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{appt.doctorName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {appt.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-sky-50 text-sky-700">
                      {(appt.type || 'in_person').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    {appt.specialty} • {appt.hospitalName}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {appt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {appt.appointmentTime}
                    </span>
                  </div>

                  {appt.reason && (
                    <div className="text-xs text-slate-500 italic mt-1">Reason: {appt.reason}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setRescheduleAppt(appt);
                      setNewRescheduleDate(appt.appointmentDate);
                      setNewRescheduleTime(appt.appointmentTime);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleCancelAppointment(appt.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Past Consultations & Clinical History</h2>
        {past.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            No previous appointment logs found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {past.map((appt) => (
              <div key={appt.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{appt.doctorName}</div>
                  <div className="text-slate-500 text-[11px]">{appt.specialty} • {appt.appointmentDate}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    appt.status?.toLowerCase() === 'completed'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 bg-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  <span className="font-bold text-sm">Schedule Clinical Consultation</span>
                </div>
                <button onClick={() => setShowBookModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Physician & Facility</label>
                  <select
                    value={booking.doctorId}
                    onChange={(e) => {
                      if (e.target.value === 'doc-001') {
                        setBooking({
                          ...booking,
                          doctorId: 'doc-001',
                          doctorName: 'Dr. Priya Ramanathan, MD',
                          specialty: 'Endocrinology & Internal Medicine',
                          hospitalName: 'Apollo Memorial Hospital, Jayanagar',
                        });
                      } else {
                        setBooking({
                          ...booking,
                          doctorId: 'doc-002',
                          doctorName: 'Dr. Arvind Swaminathan, MS',
                          specialty: 'Cardiology & Vascular Medicine',
                          hospitalName: 'Manipal Heart Foundation',
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="doc-001">Dr. Priya Ramanathan, MD — Apollo Memorial (Endocrinology)</option>
                    <option value="doc-002">Dr. Arvind Swaminathan, MS — Manipal Heart (Cardiology)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={booking.appointmentDate}
                      onChange={(e) => setBooking({ ...booking, appointmentDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Available Slot</label>
                    <select
                      value={booking.appointmentTime}
                      onChange={(e) => setBooking({ ...booking, appointmentTime: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                      <option value="10:30 AM">10:30 AM - 11:00 AM</option>
                      <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                      <option value="04:30 PM">04:30 PM - 05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'in_person', label: 'In-Clinic', icon: Building },
                      { id: 'video', label: 'Video Call', icon: Video },
                      { id: 'followup', label: 'Follow-Up', icon: Stethoscope },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setBooking({ ...booking, type: mode.id as any })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          booking.type === mode.id
                            ? 'bg-teal-50 border-teal-500 text-teal-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <mode.icon className="w-4 h-4" />
                        <span className="text-[11px]">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
                  <textarea
                    rows={2}
                    value={booking.reason}
                    onChange={(e) => setBooking({ ...booking, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <span className="font-bold text-xs">Reschedule Appointment</span>
                <button onClick={() => setRescheduleAppt(null)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select New Date</label>
                  <input
                    type="date"
                    value={newRescheduleDate}
                    onChange={(e) => setNewRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select New Time Slot</label>
                  <select
                    value={newRescheduleTime}
                    onChange={(e) => setNewRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="09:00 AM">09:00 AM - 09:30 AM</option>
                    <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                    <option value="02:30 PM">02:30 PM - 03:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setRescheduleAppt(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Save New Time
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
