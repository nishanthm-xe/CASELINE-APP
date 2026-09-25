import React, { useState } from "react";
import {
  Calendar,
  Pill,
  TrendingUp,
  MapPin,
  Droplet,
  Tent,
  PhoneCall,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
  Hospital,
  AlertOctagon,
  ExternalLink,
} from "lucide-react";
import { DemographicData, LanguageOption, PatientScreen } from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";

interface ContinuingCareScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  onNavigate: (screen: PatientScreen) => void;
  onTriggerSos: () => void;
}

export const ContinuingCareScreen: React.FC<ContinuingCareScreenProps> = ({
  patient,
  selectedLanguage,
  onNavigate,
  onTriggerSos,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "appointments"
    | "medications"
    | "trends"
    | "nearby"
    | "blood-bank"
    | "camps"
    | "emergency"
  >("appointments");

  const appointmentsList = [
    {
      id: "apt-1",
      doctor: "Dr. Ananya Sharma (Cardiology)",
      hospital: "Apollo Specialty Hospital, Chennai",
      date: "Tomorrow, 10:30 AM",
      type: "Follow-up & ECG Review",
      status: "Confirmed",
    },
    {
      id: "apt-2",
      doctor: "Dr. Rajesh K. (Endocrinology)",
      hospital: "Government General Hospital",
      date: "Oct 2, 2026, 02:00 PM",
      type: "Diabetic Care & HbA1c",
      status: "Scheduled",
    },
  ];

  const medicationTrackList = [
    {
      id: "m-1",
      name: "Metformin 500mg",
      schedule: "Twice daily after meals",
      takenToday: true,
      time: "8:00 AM",
    },
    {
      id: "m-2",
      name: "Telmisartan 40mg",
      schedule: "Once daily morning",
      takenToday: true,
      time: "8:00 AM",
    },
    {
      id: "m-3",
      name: "Atorvastatin 10mg",
      schedule: "Once daily at bedtime",
      takenToday: false,
      time: "9:00 PM",
    },
  ];

  const bloodBanks = [
    {
      name: "Red Cross Central Blood Center",
      location: "Egmore, Chennai (2.3 km)",
      available: "O+, A+, B+, AB+, O-",
      contact: "044-2819-0123",
      status: "24/7 Open",
    },
    {
      name: "Rotary TTK Voluntary Blood Bank",
      location: "T. Nagar, Chennai (3.8 km)",
      available: "All Major Blood Groups Available",
      contact: "044-2434-5678",
      status: "24/7 Open",
    },
  ];

  const healthCamps = [
    {
      title: "Free Diabetic & Hypertension Screening Camp",
      organizer: "National Health Mission & Lions Club",
      date: "Sunday, Oct 5, 2026 (9:00 AM - 2:00 PM)",
      location: "Community Hall, Ward 112",
      benefits: "Free Blood Sugar, BP, Lipid Profile & AYUSH Consultations",
    },
    {
      title: "Comprehensive Eye & Cataract Screening Camp",
      organizer: "Aravind Eye Care System",
      date: "Oct 12, 2026 (8:30 AM - 1:00 PM)",
      location: "Govt Higher Secondary School Grounds",
      benefits: "Free refractive check, cataract evaluation and surgery referral",
    },
  ];

  return (
    <div
      id="continuing-care-screen"
      className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24"
    >
      {/* Top Banner with CaseLine Avatar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CaseLineAvatar
            size="md"
            mood="IDLE"
            pose="dashboard"
            showStatusBadge={false}
          />
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Continuing Healthcare
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Continuing Care & Community Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track medications, schedule consultations, find nearby clinics, and access emergency services
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTriggerSos}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>Emergency SOS</span>
        </button>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "appointments", label: "Appointments", icon: Calendar },
          { id: "medications", label: "Medication Tracker", icon: Pill },
          { id: "trends", label: "Health Trends", icon: TrendingUp },
          { id: "nearby", label: "Nearby Clinics", icon: MapPin },
          { id: "blood-bank", label: "Blood Banks", icon: Droplet },
          { id: "camps", label: "Free Health Camps", icon: Tent },
          { id: "emergency", label: "Emergency Support", icon: PhoneCall },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Appointments */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              Upcoming Doctor Consultations
            </h3>
            <button
              type="button"
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              + Book New Visit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointmentsList.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {apt.status}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                      {apt.doctor}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {apt.hospital}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-bold text-slate-700">{apt.type}</span>
                  <span className="font-extrabold text-sky-700">{apt.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Medication Tracker */}
      {activeTab === "medications" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Today's Prescribed Medications
              </h3>
              <p className="text-xs text-slate-500">
                Synchronized directly from your verified prescriptions and intake
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              2 of 3 Doses Taken Today
            </span>
          </div>

          <div className="space-y-3">
            {medicationTrackList.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      med.takenToday
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {med.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {med.schedule} • Scheduled for {med.time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                    med.takenToday
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-sky-600 text-white hover:bg-sky-700 shadow-2xs"
                  }`}
                >
                  {med.takenToday ? "✓ Taken" : "Mark Taken"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Health Trends */}
      {activeTab === "trends" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Vital Biomarkers & Clinical Trends
          </h3>
          <p className="text-xs text-slate-500">
            Automated trend analysis based on uploaded lab tests and clinical history
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <span className="text-[11px] font-bold text-sky-800 uppercase block">
                Fasting Blood Sugar
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                136 <span className="text-xs font-semibold text-slate-500">mg/dL</span>
              </div>
              <span className="text-xs font-bold text-rose-600 block mt-1">
                ▲ Above Normal (&gt; 100)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <span className="text-[11px] font-bold text-sky-800 uppercase block">
                Blood Pressure
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                138/86 <span className="text-xs font-semibold text-slate-500">mmHg</span>
              </div>
              <span className="text-xs font-bold text-amber-600 block mt-1">
                Stage 1 Hypertension
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <span className="text-[11px] font-bold text-sky-800 uppercase block">
                HbA1c
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                7.8 <span className="text-xs font-semibold text-slate-500">%</span>
              </div>
              <span className="text-xs font-bold text-rose-600 block mt-1">
                ▲ Sub-optimal Control
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Nearby Clinics */}
      {activeTab === "nearby" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Nearby Clinics & Primary Health Centers
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Apollo Clinic & Diagnostic Center",
                dist: "1.2 km away",
                address: "Anna Salai, Chennai",
                timings: "8:00 AM - 9:00 PM",
              },
              {
                name: "Government Primary Health Center (PHC)",
                dist: "2.5 km away",
                address: "Kamarajar Street, Chennai",
                timings: "24/7 Casualty & Outpatient",
              },
            ].map((clinic, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {clinic.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {clinic.dist} • {clinic.address} • {clinic.timings}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Blood Banks */}
      {activeTab === "blood-bank" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Emergency Blood Bank Network
          </h3>
          <div className="space-y-3">
            {bloodBanks.map((b, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {b.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {b.location} • Available Groups: <b>{b.available}</b>
                  </p>
                  <p className="text-xs text-rose-700 font-bold mt-1">
                    Helpline: {b.contact} ({b.status})
                  </p>
                </div>

                <a
                  href={`tel:${b.contact}`}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1 shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Bank</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Free Health Camps */}
      {activeTab === "camps" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Upcoming Community Free Health Camps
          </h3>
          <div className="space-y-3">
            {healthCamps.map((camp, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {camp.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Organized by <b>{camp.organizer}</b>
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Free Entry
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white text-xs text-slate-600">
                  <div className="font-bold text-slate-800">
                    📅 {camp.date} • 📍 {camp.location}
                  </div>
                  <div className="text-amber-800 font-medium mt-1">
                    ✨ {camp.benefits}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Emergency Support */}
      {activeTab === "emergency" && (
        <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-rose-600" />
            <div>
              <h3 className="font-extrabold text-lg text-rose-900">
                24x7 Emergency & Ambulance Hotlines
              </h3>
              <p className="text-xs text-slate-500">
                Immediate dispatch for chest pain, stroke, or severe trauma
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-center font-black transition-all flex flex-col items-center justify-center gap-1 shadow-md shadow-rose-600/20"
            >
              <PhoneCall className="w-6 h-6 mb-1" />
              <span className="text-lg">Call 108</span>
              <span className="text-xs font-normal opacity-90">
                National Emergency Ambulance
              </span>
            </a>

            <a
              href="tel:102"
              className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-center font-black transition-all flex flex-col items-center justify-center gap-1 shadow-md shadow-sky-600/20"
            >
              <PhoneCall className="w-6 h-6 mb-1" />
              <span className="text-lg">Call 102</span>
              <span className="text-xs font-normal opacity-90">
                Maternal & Child Transport
              </span>
            </a>

            <button
              type="button"
              onClick={onTriggerSos}
              className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-center font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <AlertOctagon className="w-6 h-6 mb-1 text-rose-400" />
              <span className="text-lg">Trigger SOS</span>
              <span className="text-xs font-normal text-slate-300">
                Notify hospital nursing station
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
