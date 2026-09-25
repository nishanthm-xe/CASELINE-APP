import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Heart,
  Phone,
  PhoneCall,
  Pill,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { DemographicData, PhysicianClinicalHistory } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: DemographicData;
  historySummary?: PhysicianClinicalHistory;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  patient,
  historySummary,
}) => {
  const { t, selectedLanguage } = useLanguage();
  const [triageStatus, setTriageStatus] = useState<"alerting" | "alerted">("alerted");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border-4 border-red-600 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Urgent Header */}
        <div className="p-5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-red-950 flex items-center justify-center font-extrabold animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase tracking-wider">
                  {t("emergency.alertTitle", "Emergency Medical Alert")}
                </h2>
              </div>
              <p className="text-xs text-red-100 font-medium">
                {t("emergency.hospitalStaffNotification", "Immediate Hospital Staff & Triage Notification Active")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close", "Close")}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Triage Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
              <div>
                <h4 className="text-xs font-bold text-red-950">
                  {t("emergency.callingStaff", "Priority Triage Triggered: OPD Room 4")}
                </h4>
                <p className="text-[11px] text-red-700 mt-0.5">
                  {t("emergency.staffAlertActive", "Emergency nursing team and attending cardiologist paged.")}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
              CODE RED
            </span>
          </div>

          {/* Urgent patient message in selected language */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
            <p className="font-bold">
              {t("emergency.urgentNotice", "Your symptoms may need urgent medical attention. Please stay seated. Hospital staff has been notified.")}
            </p>
            <p className="mt-1 text-[11px] text-amber-800">
              {t("emergency.emergencyAdvice", "Please remain calm. Clinical team members are on their way to assist you.")}
            </p>
          </div>

          {/* Quick Critical Patient Stats for Attending First Responder */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              {t("finalReview.title", "Patient Snapshot")}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">{t("login.patientId", "Patient")}:</span>
                <span className="font-bold text-slate-800">{patient.name}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Age / Gender:</span>
                <span className="font-bold text-slate-800">{patient.age} Y / {patient.gender}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">{t("summary.allergiesTitle", "Allergies")}:</span>
                <span className="font-bold text-rose-600">Penicillin (Severe)</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">{t("summary.medicationHistory", "SOS Med")}:</span>
                <span className="font-bold text-emerald-700">Sorbitrate 5mg</span>
              </div>
            </div>
          </div>

          {/* Emergency Calling Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="tel:108"
              className="p-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t("emergency.callEmergency", "Call Emergency")} (108)</span>
            </a>

            <a
              href="tel:112"
              className="p-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>{t("emergency.callEmergency", "Call Emergency")} (112)</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-300 text-slate-800 hover:bg-slate-400 transition-colors"
          >
            {t("emergency.closeBtn", "Acknowledge & Close SOS")}
          </button>
        </div>
      </div>
    </div>
  );
};

