import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  AlertOctagon,
  PhoneCall,
  Loader2,
  Minimize2,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  HeartPulse,
  Apple,
  Pill,
  HelpCircle,
  Home,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergencyAlert?: boolean;
}

export const AIHealthAssistant: React.FC = () => {
  const { user, role, setActiveModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only display for patient role
  if (role !== 'patient' || !user) return null;

  const patientFirstName = user.fullName ? user.fullName.split(' ')[0] : 'there';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hi, ${patientFirstName} 👋\nHow can I help you today? You can ask about symptoms, home recovery routines, or general wellness.`,
      timestamp: 'Just now',
    },
  ]);

  const quickActions = [
    { label: 'Fever / Cold / Cough', icon: Thermometer, prompt: 'I have a mild fever, runny nose, and dry cough. What home care and monitoring should I follow?' },
    { label: 'Basic Home Care', icon: Home, prompt: 'What are safe non-medicinal home care remedies for seasonal fatigue, hydration, and sore throat?' },
    { label: 'General Health Tips', icon: HeartPulse, prompt: 'Give me practical tips to maintain consistent cardiovascular and immune health.' },
    { label: 'Diet & Lifestyle', icon: Apple, prompt: 'What dietary patterns support balanced blood sugar, cholesterol control, and gut health?' },
    { label: 'Medicine Information', icon: Pill, prompt: 'What are the golden safety rules when taking daily prescription medicines?' },
    { label: 'When Should I See a Doctor?', icon: HelpCircle, prompt: 'What warning symptoms indicate that I should schedule an urgent appointment with a doctor?' },
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(userText, user.fullName);
      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergencyAlert: res.isEmergencyAlert,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: 'I am temporarily unable to respond. If you are feeling unwell or have urgent symptoms, please contact your doctor or local hospital.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div id="ai-assistant-floating-container" className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              id="ai-assistant-open-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 text-white rounded-full shadow-lg shadow-teal-700/30 hover:shadow-xl hover:shadow-teal-700/40 transition-all font-semibold text-sm border border-teal-400/40 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="tracking-wide">AI Health Assistant</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-chat-panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[640px] h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    <span>Case Line AI</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded font-normal">
                      Clinical Triage
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">Evidence-informed health guidance</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="chat-live-voice-call-btn"
                  onClick={() => {
                    setIsOpen(false);
                    setActiveModal('live_voice');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-teal-500/30 hover:bg-teal-500/50 text-teal-200 border border-teal-400/40 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  title="Switch to Live Spoken Call (gemini-3.1-flash-live-preview)"
                >
                  <Radio className="w-3 h-3 text-teal-300 animate-pulse" />
                  <span>Live Call</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Medical Safety Disclaimer Strip */}
            <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-900 leading-tight">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>For general information only. Does not replace professional clinical evaluation or diagnose disease.</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Emergency Alert Banner */}
                    {m.isEmergencyAlert && (
                      <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                          <strong className="block text-rose-800 font-bold">Emergency Warning:</strong>
                          Symptoms indicate possible acute distress. Call emergency services immediately.
                          <button
                            onClick={() => setActiveModal('emergency_call')}
                            className="mt-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <PhoneCall className="w-3 h-3" /> Call 108 Now
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-white rounded-xl border border-slate-200 max-w-[70%]">
                  <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  <span>Synthesizing clinical advice...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {quickActions.map((qa, idx) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={idx}
                    disabled={loading}
                    onClick={() => handleSend(qa.prompt)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200/80 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3 text-teal-600" />
                    <span>{qa.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                id="ai-assistant-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(input);
                }}
                placeholder="Ask about symptoms, recovery, diet..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                id="ai-assistant-send-btn"
                disabled={!input.trim() || loading}
                onClick={() => handleSend(input)}
                className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
