import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Prescription, MedicationItem, MedicationLog } from '../../types';
import {
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  FileText,
  User,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MedicationTrackerView: React.FC = () => {
  const { user, role, addToast, t } = useApp();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSlot, setActiveSlot] = useState<'all' | 'morning' | 'afternoon' | 'night'>('all');

  // New Prescription Form State
  const [newPrescription, setNewPrescription] = useState({
    doctorName: 'Dr. Priya Ramanathan, MD (AIIMS)',
    diagnosis: 'Type 2 Diabetes Mellitus & Hypertension',
    notes: 'Maintain low sodium intake and monitor post-prandial glucose regularly.',
    medications: [
      {
        id: `med-${Date.now()}-1`,
        medicineName: 'Metformin SR',
        dosage: '500 mg',
        frequency: 'Twice daily',
        timing: 'after_food' as const,
        timeSlots: ['morning', 'night'] as ('morning' | 'night')[],
        durationDays: 30,
        instructions: 'Take with or immediately after a meal.',
        remainingDays: 24,
      },
    ],
  });

  const patientId = user?.role === 'patient' ? user.patientData?.id : user?.id || 'pat-001';

  const loadData = async () => {
    try {
      setLoading(true);
      const [rxList, logs] = await Promise.all([
        api.getPatientPrescriptions(patientId),
        api.getPatientMedicationLogs(patientId),
      ]);
      setPrescriptions(rxList || []);
      const logsArray = Array.isArray(logs) ? logs : (logs as any)?.logs || [];
      setMedLogs(logsArray);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load medication tracker', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleLogStatus = async (
    prescriptionId: string,
    medicationId: string,
    medicineName: string,
    dosage: string,
    scheduledSlot: 'morning' | 'afternoon' | 'evening' | 'night',
    status: 'taken' | 'skipped'
  ) => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const res = await api.logMedicationStatus(patientId, medicationId, {
        prescriptionId,
        medicineName,
        dosage,
        date: todayDate,
        timeSlot: scheduledSlot,
        status,
        notes: status === 'taken' ? 'Logged via Smart Schedule' : 'Patient reported mild nausea',
      });

      // Update local logs
      setMedLogs((prev) => [res.log, ...prev.filter((l) => !(l.medicationId === medicationId && l.timeSlot === scheduledSlot && l.date === todayDate))]);
      addToast(`${medicineName} marked as ${status.toUpperCase()}`, status === 'taken' ? 'success' : 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to log medication status', 'error');
    }
  };

  // Calculate adherence
  const totalLogs = medLogs.length;
  const takenLogs = medLogs.filter((l) => l.status === 'taken').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 85;

  const todayStr = new Date().toISOString().split('T')[0];

  // Extract all individual daily medication schedule items safely
  const scheduleItems: Array<{
    prescriptionId: string;
    med: MedicationItem;
    slot: 'morning' | 'afternoon' | 'evening' | 'night';
  }> = [];

  (prescriptions || []).forEach((rx) => {
    (rx.medications || []).forEach((med) => {
      let slots: ('morning' | 'afternoon' | 'evening' | 'night')[] = [];
      if (Array.isArray(med.timeSlots) && med.timeSlots.length > 0) {
        slots = med.timeSlots;
      } else if ((med as any).schedule) {
        const sch = (med as any).schedule;
        if (sch.morning) slots.push('morning');
        if (sch.afternoon) slots.push('afternoon');
        if (sch.evening) slots.push('evening');
        if (sch.night) slots.push('night');
      }
      if (slots.length === 0) {
        const freq = (med.frequency || '').toLowerCase();
        if (freq.includes('twice') || freq.includes('bid')) slots = ['morning', 'night'];
        else if (freq.includes('thrice') || freq.includes('tid')) slots = ['morning', 'afternoon', 'night'];
        else slots = ['morning'];
      }

      slots.forEach((slot) => {
        if (activeSlot === 'all' || activeSlot === slot) {
          scheduleItems.push({
            prescriptionId: rx.id,
            med: {
              ...med,
              timeSlots: slots,
            },
            slot,
          });
        }
      });
    });
  });

  const handleAddMedicationRow = () => {
    setNewPrescription((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          id: `med-${Date.now()}-${prev.medications.length + 1}`,
          medicineName: '',
          dosage: '',
          frequency: 'Once daily',
          timing: 'after_food',
          foodTiming: 'AFTER_FOOD',
          schedule: { morning: true, afternoon: false, night: false },
          timeSlots: ['morning'],
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          durationDays: 14,
          instructions: '',
          remainingDays: 14,
        },
      ],
    }));
  };

  const handleSavePrescription = async () => {
    try {
      const validMeds = newPrescription.medications.filter((m) => m.medicineName.trim());
      if (validMeds.length === 0) {
        addToast('Please provide at least one medication name', 'error');
        return;
      }

      await api.createPrescription({
        patientId,
        doctorName: newPrescription.doctorName,
        diagnosis: newPrescription.diagnosis,
        notes: newPrescription.notes,
        medications: validMeds,
      });

      setShowAddModal(false);
      await loadData();
      addToast('New prescription recorded successfully', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save prescription', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading medication schedule and prescriptions...</p>
      </div>
    );
  }

  return (
    <div id="medication-tracker-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.medicationTracker}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Digital prescriptions, daily adherence logs, dosage schedules, and clinical refill indicators.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prescription</span>
        </button>
      </div>

      {/* Adherence Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Adherence</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
              {adherenceRate >= 80 ? 'Optimal' : 'Needs Attention'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-3xl font-black text-slate-900">{adherenceRate}%</div>
            <div className="text-xs text-slate-500">dosage compliance</div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                adherenceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Prescriptions</div>
          <div className="text-3xl font-black text-teal-700 mt-2">
            {prescriptions.filter((p) => p.status?.toLowerCase() === 'active').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {(prescriptions || []).reduce((sum, p) => sum + (p.medications ? p.medications.length : 0), 0)} prescribed medicines
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Today's Schedule</div>
          <div className="text-3xl font-black text-indigo-700 mt-2">
            {scheduleItems.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Morning, afternoon & evening dosage checkpoints
          </div>
        </div>
      </div>

      {/* Schedule Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Medication Schedule</h2>
            <p className="text-xs text-slate-500">
              Check off your medications once taken to update your lifelong clinical record.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['all', 'morning', 'afternoon', 'night'] as const).map((slot) => (
              <button
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                  activeSlot === slot
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {slot === 'all' ? 'All Slots' : slot}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        {scheduleItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No medications scheduled for the selected time slot.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleItems.map(({ prescriptionId, med, slot }) => {
              const currentLog = medLogs.find(
                (l) => l.medicationId === med.id && l.timeSlot === slot && l.date === todayStr
              );
              const isTaken = currentLog?.status === 'taken';
              const isSkipped = currentLog?.status === 'skipped';

              return (
                <div
                  key={`${med.id}-${slot}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isTaken
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isSkipped
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{med.medicineName}</span>
                        <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span className="capitalize font-semibold text-slate-700">{slot} dose</span>
                        <span>•</span>
                        <span className="capitalize text-slate-600">{med.timing.replace('_', ' ')}</span>
                      </div>
                      {med.instructions && (
                        <div className="text-[11px] text-slate-500 italic mt-1">{med.instructions}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          handleLogStatus(prescriptionId, med.id, med.medicineName, med.dosage, slot, 'taken')
                        }
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isTaken
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title="Mark as Taken"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">{isTaken ? 'Taken' : 'Take'}</span>
                      </button>

                      <button
                        onClick={() =>
                          handleLogStatus(prescriptionId, med.id, med.medicineName, med.dosage, slot, 'skipped')
                        }
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSkipped
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Mark as Skipped"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{isSkipped ? 'Skipped' : 'Skip'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{med.remainingDays} days remaining</span>
                    {currentLog && (
                      <span className="font-mono text-slate-500">
                        Logged at {new Date(currentLog.recordedAt || (currentLog as any).timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescriptions Dossier */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Prescriptions & Doctor Directives</h2>
          <span className="text-xs text-slate-500 font-mono">{prescriptions.length} Records</span>
        </div>

        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{rx.diagnosis}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        rx.status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Prescribed by {rx.doctorName}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued: {rx.prescribedDate || rx.issuedDate || rx.createdAt}</span>
                </div>
              </div>

              {/* Medicines in this prescription */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {rx.medications.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{m.medicineName}</div>
                    <div className="text-teal-700 font-semibold">{m.dosage} • {m.frequency}</div>
                    <div className="text-slate-500 text-[11px] capitalize">{m.timing.replace('_', ' ')}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Course: {m.durationDays} days</div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                <div className="p-2.5 bg-white/80 rounded-lg text-xs text-slate-600 border border-slate-200/60 italic">
                  Clinical Advice: {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Prescription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 bg-teal-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  <span className="font-bold text-sm">Issue / Record New Prescription</span>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prescribing Physician</label>
                  <input
                    type="text"
                    value={newPrescription.doctorName}
                    onChange={(e) => setNewPrescription({ ...newPrescription, doctorName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Diagnosis</label>
                  <input
                    type="text"
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription({ ...newPrescription, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-700">Prescribed Medicines</label>
                    <button
                      type="button"
                      onClick={handleAddMedicationRow}
                      className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Medicine</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newPrescription.medications.map((m, idx) => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Amoxicillin)"
                            value={m.medicineName}
                            onChange={(e) => {
                              const copy = [...newPrescription.medications];
                              copy[idx].medicineName = e.target.value;
                              setNewPrescription({ ...newPrescription, medications: copy });
                            }}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 500 mg)"
                            value={m.dosage}
                            onChange={(e) => {
                              const copy = [...newPrescription.medications];
                              copy[idx].dosage = e.target.value;
                              setNewPrescription({ ...newPrescription, medications: copy });
                            }}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={m.timing}
                            onChange={(e: any) => {
                              const copy = [...newPrescription.medications];
                              copy[idx].timing = e.target.value;
                              setNewPrescription({ ...newPrescription, medications: copy });
                            }}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                          >
                            <option value="after_food">After Food</option>
                            <option value="before_food">Before Food</option>
                            <option value="with_food">With Food</option>
                            <option value="empty_stomach">Empty Stomach</option>
                          </select>

                          <input
                            type="number"
                            placeholder="Duration (days)"
                            value={m.durationDays}
                            onChange={(e) => {
                              const copy = [...newPrescription.medications];
                              copy[idx].durationDays = Number(e.target.value);
                              copy[idx].remainingDays = Number(e.target.value);
                              setNewPrescription({ ...newPrescription, medications: copy });
                            }}
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Advice / Lifestyle Notes</label>
                  <textarea
                    rows={2}
                    value={newPrescription.notes}
                    onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrescription}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Save Prescription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
