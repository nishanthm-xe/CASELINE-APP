import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  Activity,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Smile,
  Meh,
  Frown,
  Check,
  Leaf,
  Layers,
  Calendar,
  Flame,
  Droplets,
  Heart,
  Brain,
  Shield,
} from 'lucide-react';
import { AnatomicalBodyMap } from './AnatomicalBodyMap';

interface ClinicalHistoryStepProps {
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  painLevel: number;
  setPainLevel: (val: number) => void;
  duration: string;
  setDuration: (val: string) => void;
  onset: string;
  setOnset: (val: string) => void;
  bodyLocation: string;
  setBodyLocation: (val: string) => void;
  progression: string;
  setProgression: (val: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
  associatedSymptoms: string[];
  setAssociatedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  pastConditions: string[];
  setPastConditions: React.Dispatch<React.SetStateAction<string[]>>;
  currentMeds: string[];
  setCurrentMeds: React.Dispatch<React.SetStateAction<string[]>>;
  allergies: string[];
  setAllergies: React.Dispatch<React.SetStateAction<string[]>>;
  pastSurgeries: string[];
  setPastSurgeries: React.Dispatch<React.SetStateAction<string[]>>;
  familyHistory: string[];
  setFamilyHistory: React.Dispatch<React.SetStateAction<string[]>>;
  ayushEnabled: boolean;
  setAyushEnabled: (val: boolean) => void;
  prakriti: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Tridoshic';
  setPrakriti: (val: any) => void;
  agni: 'Sama' | 'Visham' | 'Tikshna' | 'Manda';
  setAgni: (val: any) => void;
  koshtha: 'Mrudu' | 'Madhyama' | 'Krura';
  setKoshtha: (val: any) => void;
  nadiNotes: string;
  setNadiNotes: (val: string) => void;
  dietHabits: string;
  setDietHabits: (val: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ClinicalHistoryStep: React.FC<ClinicalHistoryStepProps> = ({
  chiefComplaint,
  setChiefComplaint,
  painLevel,
  setPainLevel,
  duration,
  setDuration,
  onset,
  setOnset,
  bodyLocation,
  setBodyLocation,
  progression,
  setProgression,
  additionalNotes,
  setAdditionalNotes,
  associatedSymptoms,
  setAssociatedSymptoms,
  pastConditions,
  setPastConditions,
  currentMeds,
  setCurrentMeds,
  allergies,
  setAllergies,
  pastSurgeries,
  setPastSurgeries,
  familyHistory,
  setFamilyHistory,
  ayushEnabled,
  setAyushEnabled,
  prakriti,
  setPrakriti,
  agni,
  setAgni,
  koshtha,
  setKoshtha,
  nadiNotes,
  setNadiNotes,
  dietHabits,
  setDietHabits,
  onBack,
  onContinue,
}) => {
  // Input fields for adding items
  const [newSymptom, setNewSymptom] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMed, setNewMed] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newFamily, setNewFamily] = useState('');

  const handleAddItem = (
    value: string,
    setValue: (val: string) => void,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setList((prev) => [...prev, trimmed]);
    setValue('');
  };

  const handleRemoveItem = (
    index: number,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Step 4: Clinical History Details</span>
          </div>

          {/* AYUSH Protocol Toggle */}
          <button
            type="button"
            onClick={() => setAyushEnabled(!ayushEnabled)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              ayushEnabled
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>AYUSH Mode: {ayushEnabled ? 'Active' : 'Off'}</span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          Detailed Medical & Symptoms Questionnaire
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review and enrich the structured history extracted from your voice session or consultation.
        </p>
      </div>

      {/* 1. Chief Complaint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Primary Reason for Consultation (Chief Complaint) *
          </label>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Mandatory
          </span>
        </div>
        <textarea
          rows={2}
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Describe what is causing you discomfort or why you are seeking a doctor..."
          className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden font-medium"
        />
      </div>

      {/* 2. Interactive Anatomical Pain & Body Map */}
      <AnatomicalBodyMap
        selectedLocation={bodyLocation}
        onSelectLocation={setBodyLocation}
        painLevel={painLevel}
        onSelectPainLevel={setPainLevel}
        painCharacter="dull"
      />

      {/* 2b. HPI Timing & Onset Parameters */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Onset & Progression Timeline
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Onset:</label>
            <select
              value={onset}
              onChange={(e) => setOnset(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="Sudden (Acute)">Sudden (Acute)</option>
              <option value="Gradual (Subacute)">Gradual (Subacute)</option>
              <option value="Recurrent Episodes">Recurrent Episodes</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration:</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              <option value="Less than 24 hours">Less than 24 hours</option>
              <option value="1-2 days">1-2 days</option>
              <option value="3-5 days">3-5 days</option>
              <option value="1-2 weeks">1-2 weeks</option>
              <option value="Over 1 month">Over 1 month (Chronic)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Current Body Location:</label>
            <input
              type="text"
              value={bodyLocation}
              onChange={(e) => setBodyLocation(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
              placeholder="e.g. Retrosternal Chest / Heart"
            />
          </div>
        </div>
      </div>

      {/* 3. Associated Symptoms */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Associated Symptoms
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {associatedSymptoms.map((sym, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold"
            >
              <span>{sym}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx, setAssociatedSymptoms)}
                className="text-teal-600 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSymptom}
            onChange={(e) => setNewSymptom(e.target.value)}
            placeholder="Add another symptom (e.g. Mild nausea, Cough with phlegm)..."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(newSymptom, setNewSymptom, setAssociatedSymptoms);
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleAddItem(newSymptom, setNewSymptom, setAssociatedSymptoms)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 4. Chronic Medical Conditions */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Existing Chronic Medical Conditions
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {pastConditions.map((cond, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
            >
              <span>{cond}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx, setPastConditions)}
                className="text-slate-500 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="Add chronic illness (e.g. Asthma, Thyroid disorder, Kidney disease)..."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem(newCondition, setNewCondition, setPastConditions);
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleAddItem(newCondition, setNewCondition, setPastConditions)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 5. Active Medications & Known Allergies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Medications */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Current Medications
          </label>
          <div className="space-y-1.5 mb-2">
            {currentMeds.map((med, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              >
                <span className="font-medium">{med}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx, setCurrentMeds)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
              placeholder="e.g. Tab. Amlodipine 5mg..."
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={() => handleAddItem(newMed, setNewMed, setCurrentMeds)}
              className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
            Known Drug / Food Allergies
          </label>
          <div className="space-y-1.5 mb-2">
            {allergies.map((all, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900"
              >
                <span className="font-semibold">{all}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx, setAllergies)}
                  className="text-rose-400 hover:text-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="e.g. Sulfa drugs, Peanuts..."
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={() => handleAddItem(newAllergy, setNewAllergy, setAllergies)}
              className="px-3 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* AYUSH Protocol Form (if active) */}
      {ayushEnabled && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-emerald-700" />
            <span>AYUSH / Ayurveda Integrative Intake Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-emerald-900 block mb-1">Prakriti:</label>
              <select
                value={prakriti}
                onChange={(e) => setPrakriti(e.target.value as any)}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 font-medium"
              >
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Tridoshic">Tridoshic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-emerald-900 block mb-1">Agni (Digestive Fire):</label>
              <select
                value={agni}
                onChange={(e) => setAgni(e.target.value as any)}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 font-medium"
              >
                <option value="Sama">Sama (Balanced)</option>
                <option value="Tikshna">Tikshna (Intense)</option>
                <option value="Visham">Visham (Irregular)</option>
                <option value="Manda">Manda (Sluggish)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-emerald-900 block mb-1">Koshtha:</label>
              <select
                value={koshtha}
                onChange={(e) => setKoshtha(e.target.value as any)}
                className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800 font-medium"
              >
                <option value="Mrudu">Mrudu (Soft)</option>
                <option value="Madhyama">Madhyama (Normal)</option>
                <option value="Krura">Krura (Constipated)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-emerald-900 block mb-1">
              Dietary & Lifestyle Regimen (Ahara & Vihara):
            </label>
            <input
              type="text"
              value={dietHabits}
              onChange={(e) => setDietHabits(e.target.value)}
              className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Voice Assistant</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Scan / Upload Documents</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
