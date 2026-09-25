import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Pause,
  RotateCcw,
  Sparkles,
  Send,
  Keyboard,
  AlertTriangle,
  HeartPulse,
  Activity,
  ArrowRight,
  PhoneCall,
  ShieldAlert,
  Languages,
  Info,
  Loader2,
  Radio,
  Layers,
  MapPin,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../lib/store';
import {
  getLanguageByCode,
  isBrowserSpeechRecognitionAvailable,
  isBrowserSpeechSynthesisAvailable,
  isMicrophoneAvailable,
  checkActualLanguageCapabilities,
} from '../../lib/languages';
import { api } from '../../lib/api';
import { CaseLineAvatar, AvatarState } from './CaseLineAvatar';
import { SocratesQuestionCard } from './SocratesQuestionCard';
import { AnatomicalBodyMap } from './AnatomicalBodyMap';

export type VoiceState =
  | 'READY'
  | 'PERMISSION_REQUESTING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'AI_RESPONDING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR';

interface MessageTurn {
  id: string;
  sender: 'assistant' | 'patient';
  text: string;
  timestamp: string;
}

interface VoiceAssistantStepProps {
  selectedLanguage: string;
  patientId: string;
  patientName: string;
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
  associatedSymptoms: string[];
  setAssociatedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  pastConditions: string[];
  setPastConditions: React.Dispatch<React.SetStateAction<string[]>>;
  currentMeds: string[];
  setCurrentMeds: React.Dispatch<React.SetStateAction<string[]>>;
  allergies: string[];
  setAllergies: React.Dispatch<React.SetStateAction<string[]>>;
  ayushEnabled: boolean;
  onBackToLanguage: () => void;
  onContinueToHistory: () => void;
}

export const VoiceAssistantStep: React.FC<VoiceAssistantStepProps> = ({
  selectedLanguage,
  patientId,
  patientName,
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
  associatedSymptoms,
  setAssociatedSymptoms,
  pastConditions,
  setPastConditions,
  currentMeds,
  setCurrentMeds,
  allergies,
  setAllergies,
  ayushEnabled,
  onBackToLanguage,
  onContinueToHistory,
}) => {
  const langConfig = useMemo(() => getLanguageByCode(selectedLanguage), [selectedLanguage]);
  const langCaps = useMemo(() => checkActualLanguageCapabilities(selectedLanguage), [selectedLanguage]);
  const { setActiveModal } = useApp();

  // Voice Session State Machine: strictly begins in 'READY'
  const [voiceState, setVoiceState] = useState<VoiceState>('READY');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [typedMessage, setTypedMessage] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [showMicGuide, setShowMicGuide] = useState(false);
  const [showBodyMapModal, setShowBodyMapModal] = useState(false);

  // Red Flag Alert State
  const [activeRedFlag, setActiveRedFlag] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  // Compute avatar state
  const avatarState: AvatarState = useMemo(() => {
    if (voiceState === 'ERROR' || micPermissionDenied) return 'ERROR';
    if (voiceState === 'LISTENING') return 'LISTENING';
    if (voiceState === 'PROCESSING' || voiceState === 'PERMISSION_REQUESTING') return 'PROCESSING';
    if (voiceState === 'AI_RESPONDING') return 'SPEAKING';
    return 'IDLE';
  }, [voiceState, micPermissionDenied]);

  // Compute clinical SOCRATES phase dynamically based on captured data
  const socratesPhase = useMemo((): 'site' | 'onset' | 'character' | 'radiation' | 'associations' | 'timing' | 'exacerbating' | 'severity' => {
    if (!bodyLocation || bodyLocation === 'Chest / Head') return 'site';
    if (!onset || onset === 'Recent') return 'onset';
    if (!duration || duration === '1-2 days') return 'timing';
    if (painLevel === 5) return 'severity';
    if (associatedSymptoms.length === 0) return 'associations';
    return 'character';
  }, [bodyLocation, onset, duration, painLevel, associatedSymptoms]);

  // Chat conversation history
  const [conversation, setConversation] = useState<MessageTurn[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);

  // Speech Recognition, MediaStream, Synthesis, and duplicate prevention refs
  const recognitionRef = useRef<any>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Safe Text-to-Speech execution with locale matching
  const speakAssistantText = useCallback((text: string) => {
    if (!isBrowserSpeechSynthesisAvailable() || !window.speechSynthesis) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langConfig.speechCode || 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Match voice for selected language if installed on device
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchedVoice = voices.find(
            (v) =>
              v.lang.toLowerCase() === (langConfig.speechCode || '').toLowerCase() ||
              v.lang.toLowerCase().startsWith((langConfig.code || '').toLowerCase()) ||
              (langConfig.code === 'hi' && v.lang.toLowerCase().includes('hi')) ||
              (langConfig.code === 'ta' && v.lang.toLowerCase().includes('ta')) ||
              (langConfig.code === 'te' && v.lang.toLowerCase().includes('te'))
          );
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }
        }
      } catch (_voiceErr) {}

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setVoiceState('AI_RESPONDING');
      };
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setVoiceState('READY');
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setVoiceState('READY');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis safe fallback:', e);
      isSpeakingRef.current = false;
      setVoiceState('READY');
    }
  }, [langConfig]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
    isSpeakingRef.current = false;
    setVoiceState((prev) => (prev === 'AI_RESPONDING' ? 'READY' : prev));
  }, []);

  // Safe cleanup of any active media streams
  const stopMediaStream = useCallback(() => {
    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (_e) {}
      activeStreamRef.current = null;
    }
  }, []);

  // Safe cleanup of SpeechRecognition instance
  const stopListening = useCallback(() => {
    stopMediaStream();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_e) {}
      recognitionRef.current = null;
    }
    setLiveTranscript('');
    setVoiceState((prev) =>
      prev === 'LISTENING' || prev === 'PERMISSION_REQUESTING' ? 'READY' : prev
    );
  }, [stopMediaStream]);

  // Handle incoming patient input (voice transcript or typed text)
  const handlePatientInput = useCallback(
    async (text: string, isVoiceInput = false) => {
      const trimmed = text.trim();
      if (!trimmed || isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Append patient message
      const patientMsg: MessageTurn = {
        id: `pat-${Date.now()}`,
        sender: 'patient',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversation((prev) => [...prev, patientMsg]);
      setTypedMessage('');
      setLiveTranscript('');
      scrollToBottom();
      setVoiceState('PROCESSING');

      if (!chiefComplaint || chiefComplaint === 'General Health Consultation') {
        setChiefComplaint(trimmed);
      }

      try {
        // Send to Case Line Clinical Intake Voice Chat API
        const response = await api.clinicalIntakeVoiceChat({
          patientId,
          message: trimmed,
          history: conversation.map((c) => ({ role: c.sender, text: c.text })),
          language: langConfig.code,
          currentClinicalData: {
            chiefComplaint,
            painLevel,
            duration,
            onset,
            bodyLocation,
            pastConditions,
            currentMeds,
            allergies,
          },
          ayushEnabled,
        });

        if (response && response.success) {
          const assistantText =
            response.assistantResponse || 'Thank you. Could you provide more details about this symptom?';

          const assistantMsg: MessageTurn = {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: assistantText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setConversation((prev) => [...prev, assistantMsg]);
          scrollToBottom();

          if (Array.isArray(response.suggestedQuickReplies) && response.suggestedQuickReplies.length > 0) {
            setQuickReplies(response.suggestedQuickReplies);
          }

          // Structured field extractions
          if (response.structuredUpdates) {
            const u = response.structuredUpdates;
            if (u.chiefComplaint && (!chiefComplaint || chiefComplaint === 'General Health Consultation')) {
              setChiefComplaint(u.chiefComplaint);
            }
            if (u.duration) setDuration(u.duration);
            if (u.onset) setOnset(u.onset);
            if (u.location) setBodyLocation(u.location);
            if (u.severity) {
              const num = parseInt(u.severity, 10);
              if (!isNaN(num) && num >= 0 && num <= 10) setPainLevel(num);
            }
            if (Array.isArray(u.associatedSymptoms)) {
              setAssociatedSymptoms((prev) => Array.from(new Set([...prev, ...u.associatedSymptoms])));
            }
            if (Array.isArray(u.pastConditions)) {
              setPastConditions((prev) => Array.from(new Set([...prev, ...u.pastConditions])));
            }
            if (Array.isArray(u.currentMeds)) {
              setCurrentMeds((prev) => Array.from(new Set([...prev, ...u.currentMeds])));
            }
            if (Array.isArray(u.allergies)) {
              setAllergies((prev) => Array.from(new Set([...prev, ...u.allergies])));
            }
          }

          // Red flag emergency check
          if (response.redFlagResult && response.redFlagResult.status === 'EMERGENCY') {
            setIsEmergency(true);
            setActiveRedFlag(response.redFlagResult.escalationMessage || 'Urgent clinical red flags identified.');
          }

          if (inputMode === 'voice' || isVoiceInput) {
            speakAssistantText(assistantText);
          } else {
            setVoiceState('READY');
          }
        } else {
          setVoiceState('READY');
        }
      } catch (err) {
        console.warn('Voice chat API error:', err);
        const fallbackText =
          langConfig.code === 'hi'
            ? 'धन्यवाद। क्या आप बता सकते हैं कि यह तकलीफ कितने समय से है?'
            : langConfig.code === 'ta'
            ? 'நன்றி. இந்த பிரச்சனை எத்தனை நாட்களாக உள்ளது?'
            : 'Thank you. Could you share how long you have had this symptom?';

        setConversation((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            sender: 'assistant',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setVoiceState('READY');
      } finally {
        isProcessingRef.current = false;
      }
    },
    [
      chiefComplaint,
      conversation,
      duration,
      inputMode,
      langConfig.code,
      onset,
      painLevel,
      bodyLocation,
      pastConditions,
      currentMeds,
      allergies,
      ayushEnabled,
      patientId,
      setAllergies,
      setAssociatedSymptoms,
      setBodyLocation,
      setChiefComplaint,
      setCurrentMeds,
      setDuration,
      setOnset,
      setPainLevel,
      setPastConditions,
      speakAssistantText,
    ]
  );

  // Start listening with explicit microphone permission request flow
  const startListening = useCallback(async () => {
    stopSpeaking();
    stopListening();
    setMicErrorMessage(null);
    setMicPermissionDenied(false);

    // 1. Feature detection
    if (!isMicrophoneAvailable()) {
      setMicErrorMessage(
        'Microphone access is not available in this browser. You can comfortably continue using text input below.'
      );
      setVoiceState('ERROR');
      setInputMode('text');
      return;
    }

    if (!isBrowserSpeechRecognitionAvailable()) {
      setMicErrorMessage(
        `Voice speech recognition is not supported in this browser for ${langConfig.displayName}. You can continue seamlessly using text input.`
      );
      setVoiceState('ERROR');
      setInputMode('text');
      return;
    }

    // 2. Controlled State transition: PERMISSION_REQUESTING
    setVoiceState('PERMISSION_REQUESTING');

    try {
      // 3. Explicit microphone permission request via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;

      // Stop tracks on this temporary verification stream so hardware is cleanly available for SpeechRecognition
      stream.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;

      // 4. Initialize SpeechRecognition instance
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = langConfig.speechCode || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setLiveTranscript('');
        setMicErrorMessage(null);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += piece;
          } else {
            interim += piece;
          }
        }

        if (interim) {
          setLiveTranscript(interim);
        }

        if (final && final.trim()) {
          setLiveTranscript(final.trim());
          try {
            recognition.stop();
          } catch (_e) {}
          recognitionRef.current = null;
          handlePatientInput(final.trim(), true);
        }
      };

      recognition.onerror = (event: any) => {
        const errType = event.error || 'unknown';
        console.warn('Speech recognition error event:', errType);

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setMicPermissionDenied(true);
          setMicErrorMessage(
            "Microphone access is blocked. Allow microphone access in your browser's site permissions, then click Try Again."
          );
          setVoiceState('ERROR');
        } else if (errType === 'no-speech') {
          // Graceful no-speech recovery: return cleanly to READY
          setMicErrorMessage("I couldn't hear anything. Tap Start Speaking and speak again, or type below.");
          setVoiceState('READY');
        } else if (errType === 'audio-capture') {
          setMicErrorMessage(
            'I could not access the microphone. Please check your microphone connection and browser permissions.'
          );
          setVoiceState('ERROR');
        } else if (errType === 'network') {
          setMicErrorMessage('Voice processing requires an active internet connection. You can continue with text input.');
          setVoiceState('ERROR');
        } else if (errType === 'aborted') {
          setVoiceState('READY');
        } else {
          setMicErrorMessage(`Voice notice (${errType}). You can try again or continue with text input.`);
          setVoiceState('ERROR');
        }
      };

      recognition.onend = () => {
        setVoiceState((curr) => (curr === 'LISTENING' ? 'READY' : curr));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Microphone permission or start error:', err);
      stopMediaStream();

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionDenied(true);
        setMicErrorMessage(
          "Microphone access is currently blocked. Allow microphone access in your browser's site permissions, then click Try Again."
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicErrorMessage('No microphone detected on this device. Please connect a microphone or use text input.');
      } else if (err.name === 'NotReadableError') {
        setMicErrorMessage('Microphone is in use by another application. Please close other audio apps and try again.');
      } else if (err.name === 'SecurityError') {
        setMicErrorMessage(
          'Microphone permission is restricted in this preview frame. Try opening the app in a new tab or use text input.'
        );
      } else {
        setMicErrorMessage(
          `Unable to access microphone (${err.message || 'Error'}). You can retry or continue with text.`
        );
      }

      setVoiceState('ERROR');
    }
  }, [langConfig, stopSpeaking, stopListening, handlePatientInput, stopMediaStream]);

  // Toggle listening
  const handleToggleListening = () => {
    if (voiceState === 'LISTENING') {
      stopListening();
    } else {
      startListening();
    }
  };

  // Initialize conversation with native greeting
  useEffect(() => {
    const fullGreeting = `${langConfig.greeting} ${langConfig.promptQuestion || ''}`.trim();
    const greetingMessage: MessageTurn = {
      id: `greet-${Date.now()}`,
      sender: 'assistant',
      text: fullGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation([greetingMessage]);

    // Initial contextual quick replies
    if (selectedLanguage === 'ta') {
      setQuickReplies(['நெஞ்சு வலி', 'காய்ச்சல் & தலைவலி', 'வயிற்று வலி', 'மூச்சுத்திணறல்']);
    } else if (selectedLanguage === 'hi') {
      setQuickReplies(['सीने में दर्द', 'तेज़ बुखार व सिरदर्द', 'पेट में दर्द', 'सांस लेने में तकलीफ']);
    } else if (selectedLanguage === 'te') {
      setQuickReplies(['గుండె నొప్పి', 'జ్వరం & తలనొప్పి', 'కడుపు నొప్పి', 'శ్వాస ఆడకపోవడం']);
    } else if (selectedLanguage === 'bn') {
      setQuickReplies(['বুকে ব্যথা', 'জ্বর ও মাথাব্যথা', 'পেটে ব্যথা', 'শ্বাসকষ্ট']);
    } else if (selectedLanguage === 'mr') {
      setQuickReplies(['छातीत दुखणे', 'ताप आणि डोकेदुखी', 'पोटात दुखणे', 'श्वास घेण्यास त्रास']);
    } else {
      setQuickReplies(['Chest Discomfort', 'Fever & Severe Headache', 'Stomach Pain', 'Breathing Trouble']);
    }

    // Attempt soft initial speech greeting (gracefully ignored if autoplay restricted)
    const timer = setTimeout(() => {
      speakAssistantText(fullGreeting);
    }, 450);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
      stopListening();
    };
  }, [selectedLanguage, langConfig, speakAssistantText, stopSpeaking, stopListening]);

  const handleQuickReply = (reply: string) => {
    handlePatientInput(reply, false);
  };

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    handlePatientInput(typedMessage, false);
  };

  const lastAssistantMessage = useMemo(() => {
    const asstMsgs = conversation.filter((c) => c.sender === 'assistant');
    return asstMsgs[asstMsgs.length - 1]?.text || `${langConfig.greeting} ${langConfig.promptQuestion || ''}`;
  }, [conversation, langConfig]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Step 3: Case Line Voice Assistant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Conversational History Collection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultation Language: <strong className="text-slate-800 font-bold">{langConfig.displayName}</strong> ({langConfig.nativeName}). All voice interactions and AI questioning follow this language.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToLanguage}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Switch Consultation Language"
          >
            <Languages className="w-3.5 h-3.5 text-teal-700" />
            <span>Change Language</span>
          </button>

          <button
            type="button"
            onClick={onContinueToHistory}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to History Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Emergency Red Flag Alert (if detected) */}
      <AnimatePresence>
        {isEmergency && activeRedFlag && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-rose-50 border-2 border-rose-500 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md text-rose-950"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 block">
                  Clinical Red Flag Alert Triggered
                </span>
                <p className="text-xs text-rose-900 font-medium mt-0.5">{activeRedFlag}</p>
              </div>
            </div>
            <a
              href="tel:108"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Emergency (108)</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Interactive Voice Panel + Live Structured Docket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main: Voice Assistant Conversation Engine */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Voice Control Center */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-5">
            {/* Status & Replay Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    voiceState === 'LISTENING'
                      ? 'bg-rose-500 animate-ping'
                      : voiceState === 'AI_RESPONDING'
                      ? 'bg-teal-400 animate-pulse'
                      : voiceState === 'PROCESSING' || voiceState === 'PERMISSION_REQUESTING'
                      ? 'bg-amber-400 animate-spin'
                      : voiceState === 'ERROR'
                      ? 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  STATUS: {voiceState.replace('_', ' ')}
                </span>
              </div>

              {/* TTS Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakAssistantText(lastAssistantMessage)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Replay Assistant Speech"
                >
                  <Volume2 className="w-3 h-3 text-teal-300" />
                  <span>Replay</span>
                </button>
                {voiceState === 'AI_RESPONDING' && (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-semibold text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </button>
                )}
              </div>
            </div>

            {/* Voice Assistant Title & State Description */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                  Case Line Voice Assistant
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {langConfig.displayName}{' '}
                  <span className="text-slate-400 font-normal text-sm">({langConfig.nativeName})</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {voiceState === 'LISTENING'
                    ? 'Listening... Speak now.'
                    : voiceState === 'PERMISSION_REQUESTING'
                    ? 'Requesting microphone permission...'
                    : voiceState === 'PROCESSING'
                    ? 'Processing your response...'
                    : voiceState === 'AI_RESPONDING'
                    ? 'Case Line is preparing the next question...'
                    : voiceState === 'ERROR'
                    ? 'Microphone issue encountered. You can retry or continue with text.'
                    : 'Tap the microphone and start speaking.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBodyMapModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open Interactive Anatomical Body Map"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Body Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    setActiveModal('live_voice');
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
                  title="Launch Real-Time Live Voice Call (gemini-3.1-flash-live-preview)"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse text-teal-200" />
                  <span>Live Voice Call</span>
                </button>
              </div>
            </div>

            {/* Stateful CaseLine Avatar */}
            <div className="py-2 flex justify-center">
              <CaseLineAvatar
                state={avatarState}
                size="md"
                languageName={langConfig.displayName}
                onClick={handleToggleListening}
              />
            </div>

            {/* Visual Waveform Animation */}
            <div className="h-16 bg-slate-950/80 rounded-2xl flex items-center justify-center gap-1.5 px-6 border border-slate-800/80 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => {
                const isListeningOrSpeaking =
                  voiceState === 'LISTENING' || voiceState === 'AI_RESPONDING';
                return (
                  <motion.div
                    key={i}
                    animate={{
                      height: isListeningOrSpeaking
                        ? [10, Math.floor(Math.random() * 38 + 12), 10]
                        : 8,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i % 5) * 0.1,
                      ease: 'easeInOut',
                    }}
                    className={`w-1.5 rounded-full transition-all ${
                      voiceState === 'LISTENING'
                        ? 'bg-rose-400'
                        : voiceState === 'AI_RESPONDING'
                        ? 'bg-teal-400'
                        : voiceState === 'PROCESSING' || voiceState === 'PERMISSION_REQUESTING'
                        ? 'bg-amber-400'
                        : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Live Speech Recognition Transcript (when speaking) */}
            {liveTranscript && (
              <div className="p-3 bg-teal-950/40 rounded-2xl border border-teal-500/40 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-0.5">
                  Live Speech Transcript:
                </span>
                <p className="text-sm font-medium text-teal-100 italic">"{liveTranscript}"</p>
              </div>
            )}

            {/* Current Assistant Spoken Statement */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Case Line Voice Assistant ({langConfig.displayName})</span>
              </div>
              <p className="text-sm font-medium text-slate-100 leading-relaxed">
                "{lastAssistantMessage}"
              </p>
            </div>

            {/* Main Microphone Button & Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {voiceState === 'LISTENING' ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all shadow-md cursor-pointer bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30"
                  >
                    <MicOff className="w-4 h-4 animate-bounce" />
                    <span>Stop Speaking</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={voiceState === 'PROCESSING' || voiceState === 'PERMISSION_REQUESTING'}
                    onClick={startListening}
                    className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all shadow-md cursor-pointer bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold disabled:opacity-50"
                  >
                    {voiceState === 'PERMISSION_REQUESTING' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Requesting Mic...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Start Speaking</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInputMode(inputMode === 'voice' ? 'text' : 'voice')}
                  className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <Keyboard className="w-4 h-4 text-teal-400" />
                  <span>{inputMode === 'voice' ? 'Use Text' : 'Use Voice'}</span>
                </button>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-mono">
                  Engine: {langCaps.speechToTextSupported ? 'Web Speech API' : 'Direct AI Text Engine'}
                </span>
                <span className="text-[11px] text-teal-400 font-semibold">
                  Safe Clinical History Only
                </span>
              </div>
            </div>

            {/* Microphone Permission Recovery UI */}
            {micErrorMessage && (
              <div className="p-4 bg-amber-950/80 border border-amber-600/60 rounded-2xl text-xs text-amber-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold block text-white">{micErrorMessage}</span>
                    <p className="text-[11px] text-amber-300">
                      You can retry microphone access, view setup instructions, or continue immediately using text input.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-800/40">
                  <button
                    type="button"
                    onClick={startListening}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try Microphone Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMicErrorMessage(null);
                      setMicPermissionDenied(false);
                      setVoiceState('READY');
                      setInputMode('text');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <Keyboard className="w-3 h-3 text-teal-400" />
                    <span>Continue with Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMicGuide((prev) => !prev)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>{showMicGuide ? 'Hide Guide' : 'How to Allow Microphone'}</span>
                  </button>
                </div>

                {/* Clear Browser-Specific Instructions */}
                {showMicGuide && (
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Info className="w-3.5 h-3.5 text-teal-400" />
                      <span>Browser Microphone Setup:</span>
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-slate-300 leading-relaxed">
                      <li>
                        <strong>Chrome / Edge / Brave:</strong> Click the lock or site settings icon in your browser URL bar (left of the address). Toggle <strong>Microphone</strong> to <em>Allow</em>, then click <em>Try Microphone Again</em>.
                      </li>
                      <li>
                        <strong>Safari (Mac / iOS):</strong> Open Safari Settings &gt; Websites &gt; Microphone, or tap 'aA' in the address bar &gt; Website Settings &gt; Microphone: Allow.
                      </li>
                      {isInIframe && (
                        <li className="text-amber-300 font-semibold">
                          <strong>Preview Notice:</strong> If running inside an embedded iframe or preview tab, open this app in a separate browser tab to permit full microphone access, or comfortably use the text fallback.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clinical SOCRATES Question Card with Rationale Tooltip & Quick-Tap Options */}
          <SocratesQuestionCard
            currentQuestion={lastAssistantMessage}
            activePhase={socratesPhase}
            quickReplies={quickReplies}
            onSelectQuickReply={handleQuickReply}
            languageName={langConfig.displayName}
          />

          {/* Conversation History Stream */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Clinical Dialogue Stream ({conversation.length} turns)
              </span>
              <span className="text-[11px] text-slate-400">
                Live transcription & structured questions
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'patient' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1 px-1">
                    <span>{msg.sender === 'patient' ? patientName || 'You' : 'Case Line Assistant'}</span>
                    <span>• {msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'patient'
                        ? 'bg-teal-600 text-white rounded-br-2xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Dynamic 1-Tap Quick Replies */}
            {quickReplies.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Suggested Quick Responses (Tap or Speak):
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold text-teal-800 transition-all cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input Fallback Bar */}
            <form onSubmit={handleSendTyped} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Type your response in ${langConfig.displayName} or English...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-hidden"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim() || voiceState === 'PROCESSING'}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right / Sidebar: Live Extracted Clinical History Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Live Extracted Clinical Docket</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Auto-Updating
              </span>
            </div>

            {/* Chief Complaint */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Chief Complaint
              </span>
              <p className="text-xs font-bold text-slate-900 leading-snug">
                {chiefComplaint || 'Listening to your initial symptoms...'}
              </p>
            </div>

            {/* Core Present Illness Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block">Pain Severity</span>
                <strong className="text-sm font-bold text-slate-800">{painLevel} / 10</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block">Duration</span>
                <strong className="text-sm font-bold text-slate-800">{duration || 'Not specified'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block">Onset</span>
                <strong className="text-xs font-semibold text-slate-800">{onset || 'Gradual'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block">Location</span>
                <strong className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {bodyLocation || 'Chest / Head'}
                </strong>
              </div>
            </div>

            {/* Associated Symptoms */}
            {associatedSymptoms.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Associated Symptoms
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {associatedSymptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic Conditions & Active Meds */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Chronic Conditions:</span>
                <span className="font-bold text-slate-800">{pastConditions.length} active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Current Medications:</span>
                <span className="font-bold text-slate-800">{currentMeds.length} logged</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Allergies:</span>
                <span className="font-bold text-rose-700">{allergies.length} recorded</span>
              </div>
            </div>

            {/* Next Action */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onContinueToHistory}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Clinical History Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Anatomical Body Map Modal */}
      {showBodyMapModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Pain Location on Body Map</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBodyMapModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnatomicalBodyMap
              selectedLocation={bodyLocation}
              onSelectLocation={(loc) => {
                setBodyLocation(loc);
              }}
              painLevel={painLevel}
              onSelectPainLevel={setPainLevel}
              painCharacter="dull"
            />

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBodyMapModal(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
