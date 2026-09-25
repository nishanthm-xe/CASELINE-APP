import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LiveVoiceSession,
  LiveSessionStatus,
  LiveTranscriptItem,
} from '../../lib/liveVoice';
import { useApp } from '../../lib/store';
import { CaseLineAvatar, AvatarState } from '../intake/CaseLineAvatar';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Cpu,
  HeartPulse,
  PhoneCall,
  User,
  Bot,
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const VOICES: { id: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'; label: string; desc: string }[] = [
  { id: 'Zephyr', label: 'Zephyr', desc: 'Warm, empathetic & gentle' },
  { id: 'Puck', label: 'Puck', desc: 'Energetic & attentive' },
  { id: 'Charon', label: 'Charon', desc: 'Calm, steady & reassuring' },
  { id: 'Kore', label: 'Kore', desc: 'Friendly & clear clinical tone' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Authoritative & direct' },
];

const PRESET_SCENARIOS = [
  {
    title: 'General Health & Symptoms',
    prompt:
      'You are a compassionate clinical AI assistant. Discuss symptoms, suggest home wellness care, and explain medical terminology simply.',
  },
  {
    title: 'Symptom Triage & Case Taking',
    prompt:
      'You are assisting a patient with clinical case taking. Ask about chief complaints, duration, severity (1-10), and related symptoms.',
  },
  {
    title: 'Lab & Biopsy Explanation',
    prompt:
      'You are explaining biopsy and blood test results in reassuring, non-alarmist plain language. Clarify medical markers clearly.',
  },
  {
    title: 'Post-Treatment Recovery',
    prompt:
      'Provide supportive recovery advice regarding wound care, hydration, rest, and signs that warrant calling their doctor.',
  },
];

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { user, setActiveModal, addToast } = useApp();
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [status, setStatus] = useState<LiveSessionStatus>('idle');
  const [transcripts, setTranscripts] = useState<LiveTranscriptItem[]>([]);
  const [inputLevel, setInputLevel] = useState<number>(0);
  const [outputLevel, setOutputLevel] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  const sessionRef = useRef<LiveVoiceSession | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Call duration counter
  useEffect(() => {
    if (status === 'connected' || status === 'listening' || status === 'speaking') {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // Clean up session when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (sessionRef.current) {
        sessionRef.current.stop();
        sessionRef.current = null;
      }
      setStatus('idle');
      setCallDuration(0);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleStartCall = async () => {
    setErrorMessage(null);
    setTranscripts([]);
    setCallDuration(0);

    const systemPrompt =
      initialPrompt ||
      PRESET_SCENARIOS[selectedScenarioIndex]?.prompt ||
      'You are CASE LINE’s live clinical voice assistant.';

    const session = new LiveVoiceSession({
      voice: selectedVoice,
      systemPrompt,
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onTranscript: (item) => {
        setTranscripts((prev) => [...prev, item]);
      },
      onAudioLevel: (inLvl, outLvl) => {
        setInputLevel(inLvl);
        setOutputLevel(outLvl);
      },
      onError: (err) => {
        setErrorMessage(err);
        addToast(err, 'error');
      },
    });

    sessionRef.current = session;
    await session.start();
  };

  const handleEndCall = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    setStatus('closed');
  };

  const handleToggleMute = () => {
    if (!sessionRef.current) return;
    const nextMute = !isMuted;
    sessionRef.current.setMuted(nextMute);
    setIsMuted(nextMute);
  };

  const handleToggleSpeaker = () => {
    if (!sessionRef.current) return;
    const nextMute = !isSpeakerMuted;
    sessionRef.current.setVolume(nextMute ? 0 : 1);
    setIsSpeakerMuted(nextMute);
  };

  const handleInterrupt = () => {
    if (sessionRef.current) {
      sessionRef.current.stopPlayback();
      addToast('Interrupted model response', 'info');
    }
  };

  const handleCopyTranscript = () => {
    const text = transcripts
      .map((t) => `[${t.timestamp}] ${t.role.toUpperCase()}: ${t.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Conversation transcript copied to clipboard', 'success');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isLive = status === 'connected' || status === 'listening' || status === 'speaking' || status === 'interrupted';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Live Voice Conversation
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-teal-400" />
                    gemini-3.1-flash-live-preview
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Ultra-low latency bidirectional audio</span>
                  {isLive && (
                    <>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-emerald-400 font-mono font-bold text-[11px]">
                        {formatDuration(callDuration)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleEndCall();
                  onClose();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Window"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Live Audio Visualizer Stage */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
              {/* Background ambient glow */}
              <div
                className={`absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
                  status === 'speaking'
                    ? 'bg-teal-400 scale-125'
                    : status === 'listening'
                    ? 'bg-indigo-500 scale-110'
                    : 'bg-slate-700 scale-90'
                }`}
              />

              {/* CaseLine Avatar in Live Voice Call */}
              <div className="relative z-10 flex flex-col items-center">
                <CaseLineAvatar
                  state={
                    status === 'speaking'
                      ? 'SPEAKING'
                      : status === 'listening' || (status === 'connected' && !isMuted)
                      ? 'LISTENING'
                      : status === 'connecting'
                      ? 'PROCESSING'
                      : status === 'error'
                      ? 'ERROR'
                      : 'IDLE'
                  }
                  size="lg"
                  languageName={selectedVoice}
                  onClick={!isLive ? handleStartCall : undefined}
                />

                {/* Status indicator badge */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      status === 'speaking'
                        ? 'bg-teal-400 animate-pulse'
                        : status === 'connected'
                        ? 'bg-emerald-400'
                        : status === 'connecting'
                        ? 'bg-amber-400 animate-ping'
                        : status === 'error'
                        ? 'bg-rose-500'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                    {status === 'speaking'
                      ? `Gemini is Speaking (${selectedVoice})`
                      : status === 'connected'
                      ? isMuted
                        ? 'Microphone Muted'
                        : 'Listening... (Speak anytime)'
                      : status === 'connecting'
                      ? 'Connecting to Gemini Live API...'
                      : status === 'interrupted'
                      ? 'Interrupted — Ready for input'
                      : status === 'error'
                      ? 'Connection Error'
                      : 'Call Ready — Press Connect'}
                  </span>
                </div>

                {/* Real-time Dynamic Waveform Bars */}
                {isLive && (
                  <div className="mt-3 flex items-center gap-1.5 h-6">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((bar) => {
                      const level = status === 'speaking' ? outputLevel : inputLevel;
                      const variance = Math.sin(bar * 0.6 + Date.now() * 0.005) * 0.3 + 0.7;
                      const height = Math.max(4, Math.min(24, Math.round(level * 24 * variance)));
                      return (
                        <span
                          key={bar}
                          className={`w-1 rounded-full transition-all duration-75 ${
                            status === 'speaking' ? 'bg-teal-400' : 'bg-indigo-400'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block font-semibold">Live Connection Alert:</strong>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Call Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {!isLive ? (
                <button
                  id="live-api-start-call-btn"
                  onClick={handleStartCall}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all transform hover:scale-105 active:scale-95"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  Start Live Voice Conversation
                </button>
              ) : (
                <>
                  {/* Mute Mic */}
                  <button
                    id="live-api-mute-btn"
                    onClick={handleToggleMute}
                    className={`p-3.5 rounded-2xl font-medium text-xs flex items-center gap-2 transition-all ${
                      isMuted
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/40'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                    title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute Mic'}</span>
                  </button>

                  {/* Interrupt */}
                  <button
                    id="live-api-interrupt-btn"
                    onClick={handleInterrupt}
                    disabled={status !== 'speaking'}
                    className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all"
                    title="Interrupt model response immediately"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="hidden sm:inline">Interrupt</span>
                  </button>

                  {/* Speaker Mute */}
                  <button
                    id="live-api-speaker-btn"
                    onClick={handleToggleSpeaker}
                    className={`p-3.5 rounded-2xl font-medium text-xs flex items-center gap-2 transition-all ${
                      isSpeakerMuted
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                    title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                  >
                    {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    <span className="hidden sm:inline">{isSpeakerMuted ? 'Muted' : 'Speaker'}</span>
                  </button>

                  {/* End Call */}
                  <button
                    id="live-api-end-call-btn"
                    onClick={handleEndCall}
                    className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End Call</span>
                  </button>
                </>
              )}
            </div>

            {/* Voice & Clinical Topic Config (When call is not active) */}
            {!isLive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Voice Selection */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-400" />
                    <span>Select Live Voice Model Character</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVoice(v.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          selectedVoice === v.id
                            ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-xs'
                            : 'bg-slate-850 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{v.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{v.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinical Scenario Preset */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
                    <HeartPulse className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Clinical Focus Mode</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_SCENARIOS.map((sc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedScenarioIndex(idx)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          selectedScenarioIndex === idx
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-xs'
                            : 'bg-slate-850 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold text-xs">{sc.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Real-time Spoken Transcript Section */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-60">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Real-time Spoken Dialogue Transcript</span>
                </div>
                {transcripts.length > 0 && (
                  <button
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {transcripts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                    <Radio className="w-6 h-6 text-slate-600 mb-2" />
                    <p>No spoken turns yet.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Spoken turns from both you and <code className="text-teal-400 font-mono">gemini-3.1-flash-live-preview</code> will stream here in real-time.
                    </p>
                  </div>
                ) : (
                  transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`flex gap-2.5 ${
                        t.role === 'user'
                          ? 'justify-end'
                          : t.role === 'model'
                          ? 'justify-start'
                          : 'justify-center'
                      }`}
                    >
                      {t.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center shrink-0 mt-0.5 text-teal-300">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] p-2.5 rounded-xl ${
                          t.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : t.role === 'model'
                            ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 text-[11px] text-center'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400/80 mb-0.5 flex items-center justify-between gap-3">
                          <span className="font-semibold uppercase tracking-wider">
                            {t.role === 'user' ? (user?.fullName || 'Patient') : t.role === 'model' ? 'Gemini Live' : 'System'}
                          </span>
                          <span>{t.timestamp}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{t.text}</p>
                      </div>

                      {t.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  For acute life-threatening situations, dial local medical emergency response immediately.
                </span>
              </div>
              <button
                onClick={() => {
                  handleEndCall();
                  onClose();
                  setActiveModal('emergency_call');
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
              >
                <PhoneCall className="w-3 h-3" /> Emergency Call
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
