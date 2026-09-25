import React from "react";
import {
  LayoutDashboard,
  Mic,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";
import { LanguageOption, PatientScreen } from "../types";
import { getTranslation } from "../data/languages";

interface BottomNavBarProps {
  currentScreen: PatientScreen;
  onNavigate: (screen: PatientScreen) => void;
  selectedLanguage?: LanguageOption;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
  selectedLanguage,
}) => {
  // Hide bottom bar on onboarding or pure interview screens to maximize focus
  if (
    currentScreen === "welcome" ||
    currentScreen === "language-selection" ||
    currentScreen === "login"
  ) {
    return null;
  }

  const t = getTranslation(selectedLanguage?.name || "English");

  const navItems: {
    id: PatientScreen;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }[] = [
    { id: "dashboard", label: t.dashboard || "Dashboard", icon: LayoutDashboard },
    { id: "interview", label: t.startVoiceIntake || "Voice Intake", icon: Mic, highlight: true },
    { id: "timeline", label: t.timeline || "Timeline", icon: Clock },
    { id: "records", label: t.documents || "Documents", icon: FileText },
    { id: "continuing-care", label: t.continuingCare || "Care", icon: Calendar },
  ];

  return (
    <nav
      id="caseline-bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        if (item.highlight) {
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-tab-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className="relative -top-3 flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-tr from-sky-600 to-blue-700 ring-4 ring-sky-300"
                    : "bg-sky-600 hover:bg-sky-700 ring-2 ring-white"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] font-extrabold mt-0.5 whitespace-nowrap max-w-[80px] truncate ${
                  isActive ? "text-sky-700" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            id={`nav-tab-${item.id}`}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "text-sky-700 font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-sky-600" : ""}`} />
            <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap max-w-[70px] truncate">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
