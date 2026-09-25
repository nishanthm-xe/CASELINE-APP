import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Heart,
  HelpCircle,
  Info,
  ShieldAlert,
  Smartphone,
  Thermometer,
  User,
  Users,
  X,
} from "lucide-react";
import { PatientVitalsSummary, VitalMeasurement, VitalProvenance } from "../types";
import { evaluateVitals } from "../utils/redFlagEngine";

interface VitalsCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVitals?: PatientVitalsSummary;
  onSaveVitals: (vitals: PatientVitalsSummary, measurements: VitalMeasurement[]) => void;
  isHighContrast?: boolean;
}

export const VitalsCaptureModal: React.FC<VitalsCaptureModalProps> = ({
  isOpen,
  onClose,
  currentVitals,
  onSaveVitals,
  isHighContrast = false,
}) => {
  const [bpSystolic, setBpSystolic] = useState<string>(
    currentVitals?.bpSystolic ? String(currentVitals.bpSystolic) : ""
  );
  const [bpDiastolic, setBpDiastolic] = useState<string>(
    currentVitals?.bpDiastolic ? String(currentVitals.bpDiastolic) : ""
  );
  const [pulseRate, setPulseRate] = useState<string>(
    currentVitals?.pulseRate ? String(currentVitals.pulseRate) : ""
  );
  const [respiratoryRate, setRespiratoryRate] = useState<string>(
    currentVitals?.respiratoryRate ? String(currentVitals.respiratoryRate) : ""
  );
  const [temperature, setTemperature] = useState<string>(
    currentVitals?.temperature ? String(currentVitals.temperature) : ""
  );
  const [tempUnit, setTempUnit] = useState<"°F" | "°C">(
    currentVitals?.tempUnit || "°F"
  );
  const [spO2, setSpO2] = useState<string>(
    currentVitals?.spO2 ? String(currentVitals.spO2) : ""
  );
  const [bloodGlucose, setBloodGlucose] = useState<string>(
    currentVitals?.bloodGlucose ? String(currentVitals.bloodGlucose) : ""
  );
  const [glucoseType, setGlucoseType] = useState<"Random" | "Fasting" | "Post-Prandial">(
    currentVitals?.glucoseType || "Random"
  );
  const [provenance, setProvenance] = useState<VitalProvenance>(
    currentVitals?.provenance || "PATIENT_REPORTED"
  );

  if (!isOpen) return null;

  // Real-time evaluation
  const numSystolic = bpSystolic ? parseInt(bpSystolic, 10) : undefined;
  const numDiastolic = bpDiastolic ? parseInt(bpDiastolic, 10) : undefined;
  const numPulse = pulseRate ? parseInt(pulseRate, 10) : undefined;
  const numResp = respiratoryRate ? parseInt(respiratoryRate, 10) : undefined;
  const numTemp = temperature ? parseFloat(temperature) : undefined;
  const numSpO2 = spO2 ? parseInt(spO2, 10) : undefined;
  const numGlucose = bloodGlucose ? parseInt(bloodGlucose, 10) : undefined;

  const evaluation = evaluateVitals({
    bpSystolic: numSystolic,
    bpDiastolic: numDiastolic,
    pulseRate: numPulse,
    temperature: numTemp,
    tempUnit,
    spO2: numSpO2,
    bloodGlucose: numGlucose,
  });

  const handleSave = () => {
    const measurements: VitalMeasurement[] = [];
    const nowIso = new Date().toISOString();

    if (numSystolic !== undefined) {
      measurements.push({
        id: `vm-sys-${Date.now()}`,
        type: "BP_SYSTOLIC",
        name: "Blood Pressure (Systolic)",
        value: numSystolic,
        unit: "mmHg",
        isAbnormal: numSystolic >= 140 || numSystolic < 90,
        normalRange: "90 - 120 mmHg",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numDiastolic !== undefined) {
      measurements.push({
        id: `vm-dia-${Date.now()}`,
        type: "BP_DIASTOLIC",
        name: "Blood Pressure (Diastolic)",
        value: numDiastolic,
        unit: "mmHg",
        isAbnormal: numDiastolic >= 90 || numDiastolic < 60,
        normalRange: "60 - 80 mmHg",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numPulse !== undefined) {
      measurements.push({
        id: `vm-pulse-${Date.now()}`,
        type: "PULSE",
        name: "Pulse Rate",
        value: numPulse,
        unit: "bpm",
        isAbnormal: numPulse > 100 || numPulse < 50,
        normalRange: "60 - 100 bpm",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numResp !== undefined) {
      measurements.push({
        id: `vm-rr-${Date.now()}`,
        type: "RESPIRATORY_RATE",
        name: "Respiratory Rate",
        value: numResp,
        unit: "breaths/min",
        isAbnormal: numResp > 24 || numResp < 12,
        normalRange: "12 - 20 breaths/min",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numTemp !== undefined) {
      const isHigh = tempUnit === "°C" ? numTemp > 38 : numTemp >= 100.4;
      measurements.push({
        id: `vm-temp-${Date.now()}`,
        type: "TEMPERATURE",
        name: "Body Temperature",
        value: numTemp,
        unit: tempUnit,
        isAbnormal: isHigh,
        normalRange: tempUnit === "°C" ? "36.1 - 37.2 °C" : "97.0 - 99.0 °F",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numSpO2 !== undefined) {
      measurements.push({
        id: `vm-spo2-${Date.now()}`,
        type: "SPO2",
        name: "Oxygen Saturation (SpO2)",
        value: numSpO2,
        unit: "%",
        isAbnormal: numSpO2 < 95,
        normalRange: "95 - 100 %",
        provenance,
        timestamp: nowIso,
      });
    }

    if (numGlucose !== undefined) {
      measurements.push({
        id: `vm-bg-${Date.now()}`,
        type: "BLOOD_GLUCOSE",
        name: `Blood Glucose (${glucoseType})`,
        value: numGlucose,
        unit: "mg/dL",
        isAbnormal: numGlucose >= 200 || numGlucose < 70,
        normalRange: glucoseType === "Fasting" ? "70 - 100 mg/dL" : "70 - 140 mg/dL",
        provenance,
        timestamp: nowIso,
      });
    }

    const vitalsSummary: PatientVitalsSummary = {
      bpSystolic: numSystolic,
      bpDiastolic: numDiastolic,
      pulseRate: numPulse,
      respiratoryRate: numResp,
      temperature: numTemp,
      tempUnit,
      spO2: numSpO2,
      bloodGlucose: numGlucose,
      glucoseType,
      recordedAt: nowIso,
      provenance,
      abnormalFlags: evaluation.abnormalFlags,
    };

    onSaveVitals(vitalsSummary, measurements);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border ${
          isHighContrast ? "border-slate-900" : "border-slate-200"
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Patient Vital Signs Record
              </h3>
              <p className="text-xs text-slate-500">
                Structured clinical measurements with source provenance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Provenance Selector */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
            <span className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Measurement Provenance (Source of Data)</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "PATIENT_REPORTED", label: "Patient", icon: User },
                { id: "CAREGIVER_REPORTED", label: "Caregiver / ASHA", icon: Users },
                { id: "DEVICE_INTEGRATION", label: "Smart Device", icon: Smartphone },
                { id: "STAFF_ENTERED", label: "Clinic Staff", icon: Activity },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = provenance === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProvenance(opt.id as VitalProvenance)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-teal-700 text-white border-teal-800 shadow-2xs font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-teal-100/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Blood Pressure */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 block text-xs">
                Blood Pressure (BP)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Systolic (120)"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  placeholder="Diastolic (80)"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Normal: 90-120 / 60-80 mmHg</span>
            </div>

            {/* Pulse Rate */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                <span>Pulse / Heart Rate</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 76"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs font-semibold text-slate-500 shrink-0">bpm</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Normal resting: 60-100 bpm</span>
            </div>

            {/* SpO2 Oxygen Saturation */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                <span>Oxygen Saturation (SpO2)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800">Pulse Oximeter</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 98"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs font-semibold text-slate-500 shrink-0">%</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Normal: 95-100% (&lt;95% flags warning)</span>
            </div>

            {/* Body Temperature */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                <span>Body Temperature</span>
                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTempUnit("°F")}
                    className={`px-1.5 py-0.5 font-bold ${tempUnit === "°F" ? "bg-teal-700 text-white" : "bg-white text-slate-600"}`}
                  >
                    °F
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit("°C")}
                    className={`px-1.5 py-0.5 font-bold ${tempUnit === "°C" ? "bg-teal-700 text-white" : "bg-white text-slate-600"}`}
                  >
                    °C
                  </button>
                </div>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder={tempUnit === "°F" ? "e.g. 98.6" : "e.g. 37.0"}
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs font-semibold text-slate-500 shrink-0">{tempUnit}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Normal: 97.0-99.0 °F</span>
            </div>

            {/* Blood Glucose */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">
                  Blood Glucose (Sugar)
                </label>
                <div className="flex items-center gap-1">
                  {(["Random", "Fasting", "Post-Prandial"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setGlucoseType(t)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                        glucoseType === t
                          ? "bg-teal-700 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 110"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs font-semibold text-slate-500 shrink-0">mg/dL</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {glucoseType === "Fasting" ? "Fasting Normal: 70-100 mg/dL" : "Post-meal / Random: <140 mg/dL"}
              </span>
            </div>
          </div>

          {/* Anomaly Alerts Preview */}
          {evaluation.abnormalFlags.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border space-y-1.5 ${
                evaluation.severity === "URGENT"
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Deterministic Clinical Abnormalities Detected ({evaluation.abnormalFlags.length}):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {evaluation.abnormalFlags.map((flag, idx) => (
                  <li key={idx} className="font-medium">{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Vital Signs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
