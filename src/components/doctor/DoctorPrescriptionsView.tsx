import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Patient, Prescription } from '../../types';
import {
  FileText,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
  Loader2,
  Filter,
  Pill,
  User,
  Hospital,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoctorPrescriptionsViewProps {
  searchResults: Patient[];
  consentStatuses: { [patientId: string]: string };
  onViewPatientRecords?: (patient: Patient) => void;
  preselectedPatient?: Patient | null;
}

interface MedicineRow {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  foodTiming: string;
  durationDays: number;
  instructions: string;
}

export const DoctorPrescriptionsView: React.FC<DoctorPrescriptionsViewProps> = ({
  searchResults,
  consentStatuses,
  onViewPatientRecords,
  preselectedPatient,
}) => {
  const { user, addToast } = useApp();
  const doctor = user?.doctorData;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPatientId, setFilterPatientId] = useState<string>('ALL');

  // New Prescription Builder State
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient?.id || (searchResults.find((p) => consentStatuses[p.id] === 'GRANTED')?.id || '')
  );
  const [diagnosis, setDiagnosis] = useState('Routine Oncology Follow-up & Endocrine Therapy');
  const [doctorNotes, setDoctorNotes] = useState('Maintain adequate hydration. Report any persistent nausea or bone pain immediately.');
  const [validUntilDays, setValidUntilDays] = useState(90);
  const [submittingRx, setSubmittingRx] = useState(false);

  // Dynamic Medicine Rows
  const [medications, setMedications] = useState<MedicineRow[]>([
    {
      id: 'med-1',
      medicineName: 'Tab. Tamoxifen 20mg',
      dosage: '20mg',
      frequency: 'Once Daily (OD)',
      foodTiming: 'AFTER_FOOD',
      durationDays: 90,
      instructions: 'Take 1 tablet every morning after breakfast with plenty of water.',
    },
    {
      id: 'med-2',
      medicineName: 'Tab. Calcium Carbonate + Vitamin D3 500mg',
      dosage: '500mg',
      frequency: 'Once Daily (OD)',
      foodTiming: 'AFTER_FOOD',
      durationDays: 90,
      instructions: 'Take 1 tablet daily after lunch.',
    },
  ]);

  // Printable Rx Modal State
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, [doctor]);

  useEffect(() => {
    if (preselectedPatient) {
      setSelectedPatientId(preselectedPatient.id);
      setShowBuilder(true);
    }
  }, [preselectedPatient]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const list = await api.getPrescriptions(undefined, doctor?.id || 'doc-001');
      setPrescriptions(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicineRow = () => {
    setMedications([
      ...medications,
      {
        id: `med-${Date.now()}`,
        medicineName: '',
        dosage: '1 Tab',
        frequency: 'Twice Daily (BD)',
        foodTiming: 'AFTER_FOOD',
        durationDays: 14,
        instructions: 'Take as directed.',
      },
    ]);
  };

  const handleRemoveMedicineRow = (id: string) => {
    if (medications.length <= 1) {
      addToast('At least one medication is required in a prescription.', 'warning');
      return;
    }
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleMedicineChange = (id: string, field: keyof MedicineRow, value: any) => {
    setMedications(
      medications.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Check for allergy conflicts
  const selectedPatient = searchResults.find((p) => p.id === selectedPatientId);
  const patientAllergies = (selectedPatient as any)?.allergies || ['Sulfa drugs', 'Aspirin (Mild)'];

  const allergyWarnings = medications.filter((m) => {
    const nameLower = m.medicineName.toLowerCase();
    return patientAllergies.some((allergy: string) => {
      const aLower = allergy.toLowerCase();
      if (aLower.includes('sulfa') && nameLower.includes('sulfa')) return true;
      if (aLower.includes('aspirin') && (nameLower.includes('aspirin') || nameLower.includes('nsaid'))) return true;
      if (aLower.includes('penicillin') && (nameLower.includes('amox') || nameLower.includes('penicillin'))) return true;
      return false;
    });
  });

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      addToast('Please select an authorized patient.', 'error');
      return;
    }

    const validMeds = medications.filter((m) => m.medicineName.trim().length > 0);
    if (validMeds.length === 0) {
      addToast('Please enter at least one valid medication.', 'error');
      return;
    }

    setSubmittingRx(true);
    try {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + validUntilDays);

      const res = await api.createPrescription({
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        patientCode: selectedPatient.patientCode,
        doctorId: doctor?.id || 'doc-001',
        doctorName: doctor?.fullName || 'Dr. Priya Ramanathan, MD',
        doctorSpecialization: doctor?.specialization || 'Oncology & Internal Medicine',
        hospitalName: doctor?.hospitalName || 'Apollo Memorial Hospital',
        diagnosis,
        doctorNotes,
        medications: validMeds.map((m, idx) => ({
          id: `med-${Date.now()}-${idx}`,
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          foodTiming: m.foodTiming as any,
          durationDays: m.durationDays,
          instructions: m.instructions,
          status: 'Active',
          startDate: new Date().toISOString().split('T')[0],
        })),
        validUntil: expDate.toISOString().split('T')[0],
      });

      addToast(`Prescription digitally signed & issued for ${selectedPatient.fullName}!`, 'success');
      setShowBuilder(false);
      loadPrescriptions();
      if (res && (res as any).prescription) {
        setViewingRx((res as any).prescription);
      }
    } catch (e: any) {
      addToast(e.message || 'Failed to issue prescription', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (filterPatientId !== 'ALL' && rx.patientId !== filterPatientId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPatient = rx.patientName?.toLowerCase().includes(q) || rx.patientCode?.toLowerCase().includes(q);
      const matchDiag = rx.diagnosis?.toLowerCase().includes(q);
      const matchMed = rx.medications?.some((m: any) => m.medicineName?.toLowerCase().includes(q));
      if (!matchPatient && !matchDiag && !matchMed) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Clinical Prescriptions & Medication Orders</h2>
            <p className="text-xs text-slate-500">
              Digitally sign prescription dockets, synchronized with ABDM patient timelines and medication trackers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBuilder(!showBuilder)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showBuilder ? 'View Prescription List' : 'New Digital Prescription'}</span>
        </button>
      </div>

      {/* New Prescription Builder Form */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl p-6 border border-teal-200/90 shadow-md space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Digital Prescription Builder</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-5">
              {/* Patient Selector & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Consented Patient <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 bg-slate-50 focus:bg-white"
                  >
                    {searchResults.map((p) => {
                      const isConsented = consentStatuses[p.id] === 'GRANTED';
                      return (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.patientCode}) - {isConsented ? '✓ Consented' : '⚠ Consent Required'}
                        </option>
                      );
                    })}
                  </select>
                  {selectedPatient && (
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Age: {selectedPatient.age} Y</span>
                      <span>•</span>
                      <span>Blood Group: <strong className="text-rose-600">{selectedPatient.bloodGroup}</strong></span>
                      <span>•</span>
                      <span>Known Allergies: <strong className="text-amber-700">{patientAllergies.join(', ')}</strong></span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Clinical Diagnosis / Indication <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Infiltrating Ductal Carcinoma Post-Op Adjuvant Therapy"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Real-time Allergy Conflict Alert */}
              {allergyWarnings.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Drug Safety Alert: Potential Allergy Conflict Detected!</strong>
                    <p className="mt-0.5 text-[11px] text-rose-700">
                      Patient has documented allergy to <strong>{patientAllergies.join(', ')}</strong>. Verify medication class compatibility before issuing this prescription.
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Medications Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>Prescribed Medications ({medications.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Medication</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med, idx) => (
                    <div
                      key={med.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">#{idx + 1} Medication Order</span>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(med.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                            title="Remove drug"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Medicine Name</label>
                          <input
                            type="text"
                            required
                            value={med.medicineName}
                            onChange={(e) => handleMedicineChange(med.id, 'medicineName', e.target.value)}
                            placeholder="e.g. Tab. Tamoxifen 20mg or Tab. Metformin 500mg"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                            placeholder="e.g. 20mg, 1 tab"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Frequency</label>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleMedicineChange(med.id, 'frequency', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="Once Daily (OD)">Once Daily (OD)</option>
                            <option value="Twice Daily (BD)">Twice Daily (BD)</option>
                            <option value="Thrice Daily (TDS)">Thrice Daily (TDS)</option>
                            <option value="Four Times (QDS)">Four Times (QDS)</option>
                            <option value="As Needed (SOS)">As Needed (SOS)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Food Timing</label>
                          <select
                            value={med.foodTiming}
                            onChange={(e) => handleMedicineChange(med.id, 'foodTiming', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="AFTER_FOOD">After Food</option>
                            <option value="BEFORE_FOOD">Before Food</option>
                            <option value="WITH_FOOD">With Food</option>
                            <option value="AT_BEDTIME">At Bedtime</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Duration (Days)</label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={med.durationDays}
                            onChange={(e) => handleMedicineChange(med.id, 'durationDays', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Instructions</label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => handleMedicineChange(med.id, 'instructions', e.target.value)}
                            placeholder="e.g. With plenty of water"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice & Validity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Clinical Lifestyle & Dietary Advice</label>
                  <textarea
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                    placeholder="Dietary instructions, warning signs, when to seek immediate emergency care"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prescription Validity</label>
                  <select
                    value={validUntilDays}
                    onChange={(e) => setValidUntilDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  >
                    <option value={14}>14 Days (Acute condition)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={90}>90 Days (3 Months Standard)</option>
                    <option value={180}>180 Days (6 Months Chronic)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">Automatic sync to patient medication tracker</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRx}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  {submittingRx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                  <span>Digitally Sign & Issue Prescription</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescriptions List Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnosis or medicine..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterPatientId}
            onChange={(e) => setFilterPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
          >
            <option value="ALL">All Patient Records</option>
            {searchResults.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.patientCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prescription Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          <span>Loading issued prescriptions...</span>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/90 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <p>No prescriptions found matching your search. Click "New Digital Prescription" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{rx.patientCode || 'PT-000001'}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{rx.patientName}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>Prescribed: {rx.prescribedDate || new Date().toISOString().split('T')[0]}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    rx.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {rx.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">
                    <span className="text-slate-500 font-normal">Diagnosis: </span>
                    {rx.diagnosis}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <span className="text-slate-500 font-normal">Hospital: </span>
                    {rx.hospitalName} • By {rx.doctorName}
                  </div>
                </div>

                {/* Medication Chips */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Prescribed Medicines ({rx.medications?.length || 0}):
                  </span>
                  <div className="space-y-1.5">
                    {(rx.medications || []).map((med: any, mIdx: number) => (
                      <div
                        key={mIdx}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="font-semibold text-slate-800">
                          {med.medicineName} <span className="text-[10px] text-teal-700 font-mono">({med.dosage})</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                          {med.frequency} • {med.durationDays}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewingRx(rx)}
                  className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>View & Print Rx</span>
                </button>

                {onViewPatientRecords && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = searchResults.find((pt) => pt.id === rx.patientId);
                      if (p) onViewPatientRecords(p);
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    View EHR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Printable Prescription Modal */}
      <AnimatePresence>
        {viewingRx && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8"
            >
              {/* Modal Top Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Official Medical Prescription
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingRx(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Printed Prescription Sheet */}
              <div className="p-6 sm:p-8 border-2 border-slate-300 rounded-2xl bg-white space-y-6 text-slate-800">
                {/* Hospital & Doctor Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-teal-700">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-teal-900 uppercase tracking-tight">
                      {viewingRx.hospitalName || 'Apollo Memorial Hospital'}
                    </h2>
                    <p className="text-xs text-slate-600">Department of Oncology & General Medicine</p>
                    <p className="text-[11px] text-slate-500">Jayanagar 4th Block, Bengaluru, Karnataka - 560011</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-slate-900">{viewingRx.doctorName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{viewingRx.doctorSpecialization}</p>
                    <p className="text-[10px] font-mono text-slate-500">MCI/NMC Reg: MCI-KA-2014-88910</p>
                  </div>
                </div>

                {/* Patient Information Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Patient Name:</span>
                    <strong className="text-slate-900">{viewingRx.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Health ID:</span>
                    <span className="font-mono text-slate-700">{viewingRx.patientCode || 'PT-000001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Date Prescribed:</span>
                    <span className="text-slate-700">{viewingRx.prescribedDate || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Valid Until:</span>
                    <span className="text-slate-700">{viewingRx.validUntil || '90 Days'}</span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="text-xs">
                  <span className="text-slate-500 font-semibold">Clinical Indication / Diagnosis: </span>
                  <strong className="text-slate-900 text-sm">{viewingRx.diagnosis}</strong>
                </div>

                {/* Rx Symbol & Medication Table */}
                <div className="space-y-3">
                  <div className="text-2xl font-black text-teal-800 font-serif italic">℞</div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5">Medication & Strength</th>
                          <th className="p-2.5">Dosage / Freq</th>
                          <th className="p-2.5">Timing</th>
                          <th className="p-2.5">Duration</th>
                          <th className="p-2.5">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {(viewingRx.medications || []).map((m: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-900">{m.medicineName}</td>
                            <td className="p-2.5">{m.dosage || '1 Tab'} • {m.frequency}</td>
                            <td className="p-2.5">{m.foodTiming ? m.foodTiming.replace('_', ' ') : 'After Food'}</td>
                            <td className="p-2.5 font-medium">{m.durationDays} Days</td>
                            <td className="p-2.5 text-[11px] text-slate-500">{m.instructions || 'As advised.'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Clinical Notes & Doctor Advice */}
                {viewingRx.doctorNotes && (
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-xs text-slate-700">
                    <strong className="text-teal-900 block mb-0.5">Physician Advice & Lifestyle Notes:</strong>
                    <p className="text-[11px]">{viewingRx.doctorNotes}</p>
                  </div>
                )}

                {/* Signature & Seal */}
                <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div>Document generated electronically under ABDM Standards.</div>
                    <div>QR Verification: https://caseline.health/verify-rx/{viewingRx.id}</div>
                  </div>

                  <div className="text-right">
                    <div className="w-32 h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-teal-800 text-xs">Priya Ramanathan</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 mt-1">{viewingRx.doctorName}</div>
                    <div className="text-[10px] text-slate-500">MCI Registration Verified</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
