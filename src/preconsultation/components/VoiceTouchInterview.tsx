import React, { useEffect, useRef, useState } from "react";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/languages";
import { fetchAdaptiveQuestion } from "../services/apiService";
import { DemographicData, InterviewMessage, RedFlagAlert } from "../types";

interface VoiceTouchInterviewProps {
  patient: DemographicData;
  selectedLanguage: string;
  isAyushMode: boolean;
  onInterviewComplete: (
    messages: InterviewMessage[],
    redFlags: RedFlagAlert[]
  ) => void;
  isHighContrast?: boolean;
  isLargeText?: boolean;
  onTriggerSos: () => void;
}

export const VoiceTouchInterview: React.FC<VoiceTouchInterviewProps> = ({
  patient,
  selectedLanguage,
  isAyushMode,
  onInterviewComplete,
  isHighContrast = false,
  isLargeText = false,
  onTriggerSos,
}) => {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    textInLang: string;
    textInEng: string;
    category: string;
    options: string[];
    isRedFlag: boolean;
    redFlagReason?: string;
    redFlagAdvice?: string;
  } | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [activeRedFlags, setActiveRedFlags] = useState<RedFlagAlert[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS["English"];
  const langConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentQuestion]);

  // Initial greeting and first question load
  useEffect(() => {
    loadNextQuestion([]);
  }, [selectedLanguage, isAyushMode]);

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.ttsLang;
    utterance.rate = 0.9;

    setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
    }
  };

  // Web Speech API speech-to-text
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech recognition not supported in this browser. Please use touch cards or text input.");
      return;
    }

    setSpeechError(null);
    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langConfig.ttsLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setTypedInput(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        if (err.error === "not-allowed") {
          setSpeechError("Microphone permission was denied. Please allow microphone access or tap the answer options.");
        } else if (err.error !== "no-speech") {
          setSpeechError(`Voice input paused (${err.error}). You can tap an option or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Error starting speech recognition:", err);
      setIsListening(false);
      setSpeechError("Could not start microphone. You can tap any answer option below.");
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Load next question using server Gemini or fallback
  const loadNextQuestion = async (conversation: InterviewMessage[]) => {
    setIsLoadingNext(true);
    try {
      const chief =
        conversation.find((m) => m.category === "Chief Complaint")?.text || "";

      const historyPayload = conversation.map((m) => ({
        question: m.sender === "ai" ? m.text : undefined,
        patientAnswer: m.sender === "patient" ? m.text : undefined,
        category: m.category,
      }));

      const result = await fetchAdaptiveQuestion({
        language: selectedLanguage,
        chiefComplaint: chief,
        conversationHistory: historyPayload,
        patientProfile: patient,
        isAyushMode,
        currentStep: conversation.length,
      });

      if (result) {
        if (result.isInterviewComplete && conversation.length >= 4) {
          // Finished interview
          onInterviewComplete(conversation, activeRedFlags);
          return;
        }

        const qData = {
          textInLang: result.questionInLanguage,
          textInEng: result.questionInEnglish,
          category: result.clinicalCategory || "Clinical Intake",
          options: result.touchOptions || [
            "Yes, definitely",
            "Mild / Occasionally",
            "No, not experienced",
            "Not sure",
          ],
          isRedFlag: !!result.isRedFlag,
          redFlagReason: result.redFlagReason,
          redFlagAdvice: result.redFlagEmergencyAdvice,
        };

        setCurrentQuestion(qData);

        // Add AI message to thread
        const newMsg: InterviewMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          category: qData.category,
          text: qData.textInLang,
          textInEnglish: qData.textInEng,
          touchOptions: qData.options,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "ai",
        };

        setMessages((prev) => [...prev, newMsg]);

        // Speak aloud the new question
        speakText(qData.textInLang);

        // Handle red flag trigger
        if (result.isRedFlag) {
          const newFlag: RedFlagAlert = {
            symptom: result.redFlagReason || "Potential acute cardiopulmonary condition reported",
            severity: "HIGH",
            actionTaken: "Emergency red-flag banner displayed and hospital priority triage alerted.",
            detectedAt: new Date().toLocaleTimeString(),
          };
          setActiveRedFlags((prev) => [...prev, newFlag]);
        }
      }
    } catch (e) {
      console.error("Error loading question:", e);
    } finally {
      setIsLoadingNext(false);
    }
  };

  // Patient Submits an Answer (via Touch or Voice)
  const handleAnswer = (answerText: string, source: "touch" | "voice" | "text") => {
    if (!answerText.trim()) return;

    stopSpeaking();
    stopSpeechRecognition();
    setTypedInput("");

    // Check for inline red-flag symptoms in free-form answers
    const lower = answerText.toLowerCase();
    const isUrgent =
      lower.includes("chest pain") ||
      lower.includes("cannot breathe") ||
      lower.includes("left arm") ||
      lower.includes("सीने में दर्द") ||
      lower.includes("सांस फूलना") ||
      lower.includes("நெஞ்சு வலி");

    if (isUrgent) {
      const urgentFlag: RedFlagAlert = {
        symptom: answerText,
        severity: "HIGH",
        actionTaken: "Immediate red-flag triage alert flagged to physician and staff.",
        detectedAt: new Date().toLocaleTimeString(),
      };
      setActiveRedFlags((prev) => [...prev, urgentFlag]);
    }

    const patientMsg: InterviewMessage = {
      id: `patient-${Date.now()}`,
      sender: "patient",
      category: currentQuestion?.category,
      text: answerText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source,
    };

    const updated = [...messages, patientMsg];
    setMessages(updated);

    // If reached sufficient depth, user can finalize or auto-proceed
    if (updated.filter((m) => m.sender === "patient").length >= 7) {
      setTimeout(() => {
        onInterviewComplete(updated, activeRedFlags);
      }, 700);
    } else {
      loadNextQuestion(updated);
    }
  };

  const handleSkipOrNotProvided = () => {
    handleAnswer("Not provided / Unable to specify", "touch");
  };

  const patientAnswerCount = messages.filter((m) => m.sender === "patient").length;

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-4">
      {/* Red Flag Emergency Warning Banner if detected */}
      {activeRedFlags.length > 0 && (
        <div
          id="emergency-red-flag-banner"
          className="mb-4 p-4 rounded-2xl bg-red-600 text-white shadow-lg border-2 border-red-400 animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-8 h-8 text-yellow-300 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide uppercase">
                  {t.emergencyAlertTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-red-700">
                  PRIORITY TRIAGE
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-0.5 text-red-100">
                {t.emergencyAlertDesc}
              </p>
              <p className="text-[11px] text-red-200 mt-1">
                Notified Doctor Queue. If you are experiencing unbearable chest pain or severe breathlessness, press SOS below.
              </p>
            </div>
          </div>
          <button
            id="emergency-banner-sos-btn"
            type="button"
            onClick={onTriggerSos}
            className="w-full sm:w-auto px-4 py-2 text-xs font-extrabold rounded-xl bg-yellow-400 text-red-950 hover:bg-yellow-300 shadow-md shrink-0"
          >
            Open Emergency SOS
          </button>
        </div>
      )}

      {/* Top Clinical Progress & Framework Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping" />
          <span className="text-xs font-bold text-slate-800">
            Clinical History Intake: {patient.name}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-cyan-700">
            {langConfig.nativeName} ({langConfig.name})
          </span>
          {isAyushMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
              AYUSH Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 font-medium">
            Progress: {patientAnswerCount} / 7 steps
          </div>
          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (patientAnswerCount / 7) * 100)}%` }}
            />
          </div>
          {patientAnswerCount >= 3 && (
            <button
              id="finish-interview-early-btn"
              type="button"
              onClick={() => onInterviewComplete(messages, activeRedFlags)}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
            >
              Review Summary
            </button>
          )}
        </div>
      </div>

      {/* Conversation Thread Box */}
      <div
        ref={chatScrollRef}
        className={`h-72 sm:h-80 overflow-y-auto p-4 rounded-2xl border mb-4 space-y-3 shadow-inner ${
          isHighContrast
            ? "bg-black border-yellow-400 text-white"
            : "bg-slate-50/70 border-slate-200"
        }`}
      >
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-500">
                  {isAi ? "CaseLine AI Assistant" : patient.name}
                </span>
                {m.category && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                    {m.category}
                  </span>
                )}
                <span className="text-[10px] text-slate-400">{m.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  isAi
                    ? isHighContrast
                      ? "bg-zinc-800 text-white border border-yellow-400 rounded-tl-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    : isHighContrast
                    ? "bg-yellow-400 text-black font-bold rounded-tr-none"
                    : "bg-cyan-600 text-white font-medium rounded-tr-none"
                } ${isLargeText ? "text-base" : "text-sm"}`}
              >
                <p>{m.text}</p>
                {isAi && m.textInEnglish && selectedLanguage !== "English" && (
                  <p className="mt-1 text-xs opacity-70 italic border-t border-slate-200/40 pt-1">
                    En: {m.textInEnglish}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isLoadingNext && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl border border-slate-200 max-w-xs">
            <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" />
            <span>Adapting follow-up question in {langConfig.name}...</span>
          </div>
        )}
      </div>

      {/* Interactive Controls & Dual Input (Option A: Speak / Option B: Tap) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${
          isHighContrast
            ? "bg-zinc-900 border-yellow-400"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Audio Assistance Controls: Repeat / Speak aloud / Mic feedback */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              id="repeat-audio-btn"
              type="button"
              onClick={() => {
                if (currentQuestion) speakText(currentQuestion.textInLang);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Listen to question again"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>{t.repeatQuestion}</span>
            </button>

            {isSpeakingTts && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute</span>
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Speak or Tap below
          </span>
        </div>

        {/* Speech Error Warning if any */}
        {speechError && (
          <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Big Dual Interaction Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* OPTION A: SPEAK NATURALLY (Big Microphone Button) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-b from-cyan-50 to-teal-50 border border-cyan-200 text-center">
            <button
              id="mic-record-btn"
              type="button"
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                isListening
                  ? "bg-red-600 text-white animate-pulse ring-4 ring-red-300"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 ring-4 ring-cyan-100"
              }`}
              title={isListening ? "Stop listening" : "Tap to speak your answer"}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            <p className="mt-2 text-xs font-bold text-slate-800">
              {isListening ? t.listening : t.tapToSpeak}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Natural voice in {langConfig.nativeName}
            </p>
          </div>

          {/* OPTION B: TAP ANSWER CARDS */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Tap One-Touch Answer Cards:
              </span>
              <button
                type="button"
                onClick={handleSkipOrNotProvided}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Mark "Not Provided"
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentQuestion?.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(opt, "touch")}
                  className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all active:scale-98 flex items-center justify-between gap-2 shadow-2xs ${
                    isHighContrast
                      ? "bg-black text-white border-yellow-400 hover:bg-zinc-800"
                      : "bg-slate-50 hover:bg-cyan-50/80 border-slate-200 hover:border-cyan-400 text-slate-800"
                  }`}
                >
                  <span>{opt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-600 shrink-0 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Free-form Text Typing Fallback for loud hospital corridors */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            id="manual-answer-input"
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && typedInput.trim()) {
                handleAnswer(typedInput, "text");
              }
            }}
            placeholder={`Or type / correct your response in ${langConfig.name}...`}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            id="send-manual-answer-btn"
            type="button"
            disabled={!typedInput.trim()}
            onClick={() => handleAnswer(typedInput, "text")}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
