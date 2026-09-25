import React, { useState } from "react";
import { AvatarMood, AvatarPose, InterviewState } from "../types";
import {
  Mic,
  Activity,
  Sparkles,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  Languages,
  FileText,
} from "lucide-react";

interface CaseLineAvatarProps {
  character?: "female" | "male";
  mood?: AvatarMood;
  interviewState?: InterviewState;
  pose?: AvatarPose;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  speechText?: string;
  subText?: string;
  speechBubblePosition?: "bottom" | "top" | "right" | "left";
  onClick?: () => void;
  showStatusBadge?: boolean;
  showWaveformBars?: boolean;
  className?: string;
}

export const CaseLineAvatar: React.FC<CaseLineAvatarProps> = ({
  character = "female",
  mood = "IDLE",
  interviewState,
  pose = "dashboard",
  size = "md",
  speechText,
  subText,
  speechBubblePosition = "bottom",
  onClick,
  showStatusBadge = true,
  showWaveformBars = true,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  // Dynamically derive active mood from interviewState (IDLE, LISTENING, PROCESSING, SPEAKING, ERROR) or fallback mood prop
  const activeMood: AvatarMood = interviewState
    ? interviewState === "READY"
      ? "IDLE"
      : interviewState
    : mood;

  // Maintain consistent character identity
  const imageSrc =
    character === "male"
      ? "/caseline-male-avatar.jpg"
      : "/caseline-avatar.jpg";

  // Dimension scaling
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-44 h-44",
    hero: "w-56 h-56 md:w-64 md:h-64",
  };

  const badgeSizeMap = {
    sm: "w-4 h-4 -bottom-0.5 -right-0.5",
    md: "w-6 h-6 -bottom-1 -right-1 text-xs",
    lg: "w-8 h-8 bottom-0 right-0 text-sm",
    xl: "w-10 h-10 bottom-1 right-1 text-base",
    hero: "w-12 h-12 bottom-2 right-2 text-lg",
  };

  // State-driven Ring Glow & CSS Animation Classes
  const getContainerAnimationClass = () => {
    switch (activeMood) {
      case "LISTENING":
        return "animate-caseline-listen-glow ring-4 ring-sky-400 ring-offset-2 ring-offset-white";
      case "PROCESSING":
        return "animate-caseline-processing-pulse ring-4 ring-indigo-400 ring-offset-2 ring-offset-white";
      case "SPEAKING":
        return "animate-caseline-speak-glow animate-caseline-speak-cadence ring-4 ring-teal-400 ring-offset-2 ring-offset-white";
      case "ERROR":
        return "ring-4 ring-amber-400 ring-offset-2 ring-offset-white shadow-lg shadow-amber-400/30 animate-pulse";
      case "COMPLETED":
        return "ring-4 ring-emerald-400 ring-offset-2 ring-offset-white shadow-lg shadow-emerald-400/40";
      case "IDLE":
      default:
        return "animate-caseline-breathe ring-2 ring-sky-200/90 ring-offset-2 ring-offset-white shadow-md shadow-sky-100/50";
    }
  };

  // Badge icon depending on real-time state and pose
  const renderBadge = () => {
    if (!showStatusBadge) return null;

    if (activeMood === "LISTENING") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-sky-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20 animate-bounce`}
          title="Listening to your voice..."
        >
          <Mic className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (activeMood === "PROCESSING") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
          title="Processing with Clinical AI..."
        >
          <Sparkles className="w-3/5 h-3/5 animate-spin" />
        </span>
      );
    }
    if (activeMood === "SPEAKING") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20 animate-pulse`}
          title="Speaking question aloud..."
        >
          <Volume2 className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (activeMood === "COMPLETED") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
          title="Intake Complete & Verified"
        >
          <CheckCircle2 className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (activeMood === "ERROR") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
          title="Microphone or speech issue"
        >
          <AlertCircle className="w-3/5 h-3/5" />
        </span>
      );
    }

    // Default pose badges when IDLE
    if (pose === "welcome" || pose === "dashboard") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
        >
          <Stethoscope className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (pose === "language") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
        >
          <Languages className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (pose === "login") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-teal-600 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
        >
          <ShieldCheck className="w-3/5 h-3/5" />
        </span>
      );
    }
    if (pose === "document" || pose === "summary") {
      return (
        <span
          className={`absolute ${badgeSizeMap[size]} bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
        >
          <FileText className="w-3/5 h-3/5" />
        </span>
      );
    }

    return (
      <span
        className={`absolute ${badgeSizeMap[size]} bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20`}
      >
        <Activity className="w-3/5 h-3/5" />
      </span>
    );
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Outer wrapper with real-time acoustic, orbital, and vocal effects */}
      <div className="relative inline-flex items-center justify-center">
        {/* ========================================================= */}
        {/* REAL-TIME STATE: LISTENING (Concentric Expanding Ripples) */}
        {/* ========================================================= */}
        {activeMood === "LISTENING" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Concentric Ripple 1 */}
            <span
              style={{
                animation: "caseline-listen-ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
              }}
              className="absolute inset-0 rounded-full bg-sky-400/25 pointer-events-none"
            />
            {/* Concentric Ripple 2 */}
            <span
              style={{
                animation: "caseline-listen-ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.65s",
              }}
              className="absolute inset-0 rounded-full bg-sky-300/30 pointer-events-none"
            />
            {/* Concentric Ripple 3 */}
            <span
              style={{
                animation: "caseline-listen-ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.3s",
              }}
              className="absolute inset-0 rounded-full bg-sky-200/35 pointer-events-none"
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* REAL-TIME STATE: SPEAKING (Concentric Vocal Speech Waves)  */}
        {/* ========================================================= */}
        {activeMood === "SPEAKING" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Speech Wave 1 */}
            <span
              style={{
                animation: "caseline-speak-wave 1.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite",
              }}
              className="absolute inset-0 rounded-full bg-teal-400/25 pointer-events-none"
            />
            {/* Speech Wave 2 */}
            <span
              style={{
                animation: "caseline-speak-wave 1.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite 0.85s",
              }}
              className="absolute inset-0 rounded-full bg-teal-300/30 pointer-events-none"
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* REAL-TIME STATE: PROCESSING (Rotating Luminous Orbit Ring) */}
        {/* ========================================================= */}
        {activeMood === "PROCESSING" && (
          <div className="absolute -inset-2.5 pointer-events-none rounded-full flex items-center justify-center animate-caseline-orbital">
            <div className="w-full h-full rounded-full border-2 border-transparent border-t-indigo-500 border-r-sky-400/80 border-b-indigo-300/30 opacity-90 shadow-xs" />
            {/* Orbiting particle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-400/70" />
          </div>
        )}

        {/* ========================================================= */}
        {/* Main Avatar Image Container (Preserving Constant Character) */}
        {/* ========================================================= */}
        <div
          onClick={onClick}
          className={`relative rounded-full overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200 flex items-center justify-center transition-all duration-500 ease-out z-10 ${
            sizeMap[size]
          } ${getContainerAnimationClass()} ${
            onClick ? "cursor-pointer hover:scale-105 active:scale-98" : ""
          }`}
        >
          {!imageError ? (
            <img
              src={imageSrc}
              alt={
                character === "male"
                  ? "CASE LINE Male Healthcare Assistant"
                  : "CASE LINE AI Healthcare Specialist"
              }
              className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out ${
                activeMood === "SPEAKING"
                  ? "scale-105"
                  : activeMood === "LISTENING"
                  ? "scale-103"
                  : "scale-100"
              }`}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            /* Pristine SVG Doctor Avatar Fallback preserving the exact same visual identity */
            <div className="w-full h-full flex flex-col items-center justify-end bg-gradient-to-b from-sky-50 to-sky-100">
              <div className="w-1/2 h-1/2 rounded-full bg-amber-200 border border-amber-300 relative mt-2 flex items-center justify-center shadow-inner">
                {/* Hair */}
                <div className="absolute -top-1 w-full h-1/2 bg-slate-800 rounded-t-full" />
                {/* Eyes */}
                <div className="flex gap-2 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                </div>
                {/* Reassuring Smile */}
                <div className="absolute bottom-1.5 w-3 h-1.5 border-b-2 border-slate-700 rounded-full" />
              </div>
              {/* Doctor White Coat & Stethoscope */}
              <div className="w-4/5 h-2/5 bg-white rounded-t-xl border-t-2 border-sky-400 relative flex justify-center shadow-sm">
                <div className="w-2/5 h-full bg-teal-600 rounded-t-md mx-auto" />
                <div className="absolute top-1 w-3/4 h-2 border-b-2 border-slate-700 rounded-full" />
              </div>
            </div>
          )}

          {/* Subdued cognitive scanning beam during PROCESSING */}
          {activeMood === "PROCESSING" && (
            <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-[0.5px] flex items-center justify-center overflow-hidden">
              <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-sky-400/30 to-transparent animate-caseline-shimmer pointer-events-none" />
              <div className="w-7 h-7 rounded-full border-2 border-white/70 border-t-white animate-spin" />
            </div>
          )}

          {/* Integrated Real-time Equalizer Waveform Overlay for large/hero avatars */}
          {showWaveformBars && (size === "lg" || size === "xl" || size === "hero") && (
            <>
              {activeMood === "LISTENING" && (
                <div className="absolute bottom-2 inset-x-0 mx-auto w-16 h-4 bg-sky-950/60 backdrop-blur-xs rounded-full px-2 flex items-center justify-center gap-0.5 z-20">
                  <span
                    style={{ animation: "caseline-eq-1 0.7s ease-in-out infinite" }}
                    className="w-1 bg-sky-400 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-2 0.7s ease-in-out infinite 0.15s" }}
                    className="w-1 bg-sky-300 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-3 0.7s ease-in-out infinite 0.3s" }}
                    className="w-1 bg-white rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-4 0.7s ease-in-out infinite 0.45s" }}
                    className="w-1 bg-sky-300 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-5 0.7s ease-in-out infinite 0.6s" }}
                    className="w-1 bg-sky-400 rounded-full"
                  />
                </div>
              )}
              {activeMood === "SPEAKING" && (
                <div className="absolute bottom-2 inset-x-0 mx-auto w-16 h-4 bg-teal-950/60 backdrop-blur-xs rounded-full px-2 flex items-center justify-center gap-0.5 z-20">
                  <span
                    style={{ animation: "caseline-eq-2 0.6s ease-in-out infinite" }}
                    className="w-1 bg-teal-400 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-4 0.6s ease-in-out infinite 0.12s" }}
                    className="w-1 bg-emerald-300 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-1 0.6s ease-in-out infinite 0.24s" }}
                    className="w-1 bg-white rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-3 0.6s ease-in-out infinite 0.36s" }}
                    className="w-1 bg-emerald-300 rounded-full"
                  />
                  <span
                    style={{ animation: "caseline-eq-5 0.6s ease-in-out infinite 0.48s" }}
                    className="w-1 bg-teal-400 rounded-full"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Status Badge */}
        {renderBadge()}
      </div>

      {/* Optional Speech Bubble if provided */}
      {speechText && (
        <div className="mt-3 relative max-w-xs sm:max-w-md bg-white border border-sky-200 rounded-2xl p-3.5 shadow-md text-center transition-all animate-fade-in z-20">
          {/* Bubble triangle pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-sky-200 rotate-45" />
          <p className="relative z-10 text-sm md:text-base font-bold text-slate-800 leading-snug">
            {speechText}
          </p>
          {subText && (
            <p className="relative z-10 text-xs text-sky-700 mt-1 font-semibold">
              {subText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
