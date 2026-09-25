import React, { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Trash2,
  DollarSign,
  Save,
  Loader2,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface DoctorAvailabilityViewProps {
  docAvailability: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE';
  updatingAvailability: boolean;
  onUpdateAvailability: (status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE') => Promise<void>;
}

export const DoctorAvailabilityView: React.FC<DoctorAvailabilityViewProps> = ({
  docAvailability,
  updatingAvailability,
  onUpdateAvailability,
}) => {
  const { user, addToast } = useApp();
  const doctor = user?.doctorData;

  const [savingSchedule, setSavingSchedule] = useState(false);

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Monday', active: true, startTime: '09:30', endTime: '13:30', eveningStart: '16:30', eveningEnd: '19:30', maxPatients: 25 },
    { day: 'Tuesday', active: true, startTime: '09:30', endTime: '13:30', eveningStart: '16:30', eveningEnd: '19:30', maxPatients: 25 },
    { day: 'Wednesday', active: true, startTime: '09:30', endTime: '13:30', eveningStart: '16:30', eveningEnd: '19:30', maxPatients: 25 },
    { day: 'Thursday', active: true, startTime: '09:30', endTime: '13:30', eveningStart: '16:30', eveningEnd: '19:30', maxPatients: 25 },
    { day: 'Friday', active: true, startTime: '09:30', endTime: '13:30', eveningStart: '16:30', eveningEnd: '19:30', maxPatients: 25 },
    { day: 'Saturday', active: true, startTime: '09:30', endTime: '14:00', eveningStart: '', eveningEnd: '', maxPatients: 18 },
    { day: 'Sunday', active: false, startTime: '', endTime: '', eveningStart: '', eveningEnd: '', maxPatients: 0 },
  ]);

  // Blocked / Leave Dates
  const [leaveDates, setLeaveDates] = useState([
    { id: '1', date: '2026-09-20', reason: 'National Oncology Conference Guest Lecture' },
    { id: '2', date: '2026-10-02', reason: 'Gandhi Jayanti Public Holiday' },
  ]);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');

  // Consultation Fees
  const [opdFee, setOpdFee] = useState(800);
  const [teleconsultFee, setTeleconsultFee] = useState(600);
  const [followupDays, setFollowupDays] = useState(7);

  const handleToggleDay = (dayName: string) => {
    setWeeklySchedule(
      weeklySchedule.map((d) => (d.day === dayName ? { ...d, active: !d.active } : d))
    );
  };

  const handleTimeChange = (dayName: string, field: string, val: any) => {
    setWeeklySchedule(
      weeklySchedule.map((d) => (d.day === dayName ? { ...d, [field]: val } : d))
    );
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveDate || !newLeaveReason) {
      addToast('Please provide both date and reason for leave.', 'error');
      return;
    }
    setLeaveDates([...leaveDates, { id: `leave-${Date.now()}`, date: newLeaveDate, reason: newLeaveReason }]);
    setNewLeaveDate('');
    setNewLeaveReason('');
    addToast('Leave date blocked on consultation calendar.', 'success');
  };

  const handleRemoveLeave = (id: string) => {
    setLeaveDates(leaveDates.filter((l) => l.id !== id));
    addToast('Blocked date removed.', 'info');
  };

  const handleSaveAllSettings = async () => {
    if (!doctor) return;
    setSavingSchedule(true);
    try {
      await api.updateDoctorAvailability(doctor.id, {
        availabilityStatus: docAvailability,
        opdSchedule: JSON.stringify({
          weeklySchedule,
          leaveDates,
          fees: { opdFee, teleconsultFee, followupDays },
        }),
      });
      addToast('OPD Schedule & Consultation settings saved to server.', 'success');
    } catch (e: any) {
      addToast(e.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Doctor OPD Availability & Slot Management</h2>
            <p className="text-xs text-slate-500">
              Configure your clinical consultation hours, video teleconsultation windows, and leave calendar.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={savingSchedule}
          onClick={handleSaveAllSettings}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save OPD Settings</span>
        </button>
      </div>

      {/* Live Status Control Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Real-Time Clinical Status
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              docAvailability === 'AVAILABLE'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : docAvailability === 'IN_CONSULTATION'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {docAvailability === 'AVAILABLE'
              ? '● Available for Consultations'
              : docAvailability === 'IN_CONSULTATION'
              ? '● In Procedure / Consult'
              : '● Out of Office / On Leave'}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          This status is instantly visible to hospital triage desks, ER coordinators, and patients booking appointments:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() => onUpdateAvailability('AVAILABLE')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              docAvailability === 'AVAILABLE'
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-sm font-bold text-emerald-900">Available (OPD Active)</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Currently in consultation room, accepting walk-in OPD & scheduled patients.
            </p>
          </button>

          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() => onUpdateAvailability('IN_CONSULTATION')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              docAvailability === 'IN_CONSULTATION'
                ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-sm font-bold text-amber-900">In Procedure / OT</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              Currently scrubbed in for biopsy, surgical procedure, or emergency rounds.
            </p>
          </button>

          <button
            type="button"
            disabled={updatingAvailability}
            onClick={() => onUpdateAvailability('ON_LEAVE')}
            className={`p-4 rounded-2xl text-left border transition-all ${
              docAvailability === 'ON_LEAVE'
                ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-sm font-bold text-rose-900">On Leave / Off Duty</strong>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <p className="text-[11px] text-rose-700 mt-1">
              Unavailable for outpatient consultations. Urgent cases routed to duty physician.
            </p>
          </button>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Weekly Consultation Timings
            </h3>
            <p className="text-xs text-slate-500">Specify morning and evening OPD consultation hours per day.</p>
          </div>
          <span className="text-xs font-semibold text-teal-700">6 Days Active</span>
        </div>

        <div className="space-y-2.5">
          {weeklySchedule.map((day) => (
            <div
              key={day.day}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs ${
                day.active ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 w-36">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={() => handleToggleDay(day.day)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-900">{day.day}</span>
              </div>

              {day.active ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Morning Session</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleTimeChange(day.day, 'startTime', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleTimeChange(day.day, 'endTime', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Evening Session</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={day.eveningStart}
                        onChange={(e) => handleTimeChange(day.day, 'eveningStart', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={day.eveningEnd}
                        onChange={(e) => handleTimeChange(day.day, 'eveningEnd', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Max Patients</span>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={day.maxPatients}
                        onChange={(e) => handleTimeChange(day.day, 'maxPatients', Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">OPD Closed / Rest Day</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave & Blocked Dates + Consultation Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Calendar */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Blocked & Leave Dates
          </h3>

          <form onSubmit={handleAddLeave} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Date</label>
                <input
                  type="date"
                  required
                  value={newLeaveDate}
                  onChange={(e) => setNewLeaveDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="e.g. Conference / Personal"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Add Blocked Date</span>
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {leaveDates.map((leave) => (
              <div
                key={leave.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-900">{leave.date}</strong>
                  <span className="text-slate-500 block text-[11px]">{leave.reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLeave(leave.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Fees */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Consultation Fee Structure
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">In-Person OPD Consultation Fee (₹)</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">₹</span>
                <input
                  type="number"
                  value={opdFee}
                  onChange={(e) => setOpdFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Video Tele-Consultation Fee (₹)</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">₹</span>
                <input
                  type="number"
                  value={teleconsultFee}
                  onChange={(e) => setTeleconsultFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Complimentary Follow-up Window (Days)</label>
              <input
                type="number"
                value={followupDays}
                onChange={(e) => setFollowupDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Free follow-up review for reports within this window.</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveAllSettings}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition text-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Consultation Rates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
