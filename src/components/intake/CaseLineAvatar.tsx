import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Volume2, AlertCircle, Sparkles } from 'lucide-react';

export type AvatarState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

export interface CaseLineAvatarProps {
  state: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'female' | 'male';
  languageName?: string;
  speechBubbleText?: string;
  speechBubbleTitle?: string;
  showStatusPill?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CaseLineAvatar: React.FC<CaseLineAvatarProps> = ({
  state,
  size = 'md',
  variant = 'female',
  languageName = 'English',
  speechBubbleText,
  speechBubbleTitle,
  showStatusPill = true,
  onClick,
  className = '',
}) => {
  // State for natural periodic blinking
  const [isBlinking, setIsBlinking] = useState(false);
  // State for speech mouth articulation animation loop
  const [mouthFrame, setMouthFrame] = useState(0);

  // Natural spontaneous blinking: blinks every 3.2 - 4.8 seconds
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);

      const nextDelay = 3000 + Math.random() * 2000;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3200);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Speech mouth articulation loop when SPEAKING
  useEffect(() => {
    if (state !== 'SPEAKING') {
      setMouthFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 4);
    }, 140);

    return () => clearInterval(interval);
  }, [state]);

  // Size configurations
  const sizeMap = {
    sm: {
      container: 'w-24 h-24',
      svg: 96,
      ringSize: 'w-32 h-32',
    },
    md: {
      container: 'w-32 h-32 sm:w-36 sm:h-36',
      svg: 144,
      ringSize: 'w-44 h-44 sm:w-48 sm:h-48',
    },
    lg: {
      container: 'w-40 h-40 sm:w-44 sm:h-44',
      svg: 176,
      ringSize: 'w-56 h-56',
    },
    xl: {
      container: 'w-48 h-48 sm:w-52 sm:h-52',
      svg: 200,
      ringSize: 'w-64 h-64',
    },
  }[size];

  // Head animation variants based on voice state
  const getHeadMotion = () => {
    switch (state) {
      case 'LISTENING':
        return {
          y: [0, -2, 0],
          rotate: [0, 1.2, 0],
          transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' as const },
        };
      case 'PROCESSING':
        return {
          y: [0, -3, 0],
          rotate: [0, -1, 0, 1, 0],
          transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' as const },
        };
      case 'SPEAKING':
        return {
          y: [0, -1.8, 0, -2.4, 0],
          rotate: [-0.6, 0.6, -0.4, 0.4, -0.6],
          transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' as const },
        };
      case 'ERROR':
        return {
          y: 0,
          rotate: 0,
        };
      case 'IDLE':
      default:
        return {
          y: [0, -2, 0],
          rotate: [0, 0.3, 0],
          transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' as const },
        };
    }
  };

  // Dynamic mouth shapes for speaking phonemes
  const getMouthPath = () => {
    if (state === 'SPEAKING') {
      switch (mouthFrame) {
        case 1:
          // Slightly open 'ah' / open vowel
          return 'M 93 147 Q 100 144 107 147 Q 107 155 100 156 Q 93 155 93 147 Z';
        case 2:
          // Rounded 'oh' shape
          return 'M 95 148 Q 100 145 105 148 Q 106 154 100 155 Q 94 154 95 148 Z';
        case 3:
          // Wide gentle smile articulation
          return 'M 92 147 Q 100 149 108 147 Q 107 152 100 153 Q 93 152 92 147 Z';
        case 0:
        default:
          // Returning to soft speaking curve
          return 'M 93 147 Q 100 145 107 147 Q 100 151 93 147 Z';
      }
    }

    if (state === 'LISTENING') {
      // Attentive slight soft smile
      return 'M 93 148 Q 100 152 107 148 Q 100 150 93 148 Z';
    }

    if (state === 'PROCESSING') {
      // Thoughtful gentle smile
      return 'M 93 148 Q 100 151 107 148 Q 100 149 93 148 Z';
    }

    if (state === 'ERROR') {
      // Calm, neutral line
      return 'M 94 148 Q 100 148 106 148';
    }

    // IDLE: Calm, friendly, warm smile
    return 'M 92 147 Q 100 153 108 147 Q 100 151 92 147 Z';
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
    >
      {/* Background Acoustic Waves / Glow Rings */}
      <div className="relative flex items-center justify-center">
        {/* LISTENING: Attentive Concentric Expanding Soundwave Rings */}
        {state === 'LISTENING' && (
          <>
            <motion.div
              initial={{ scale: 0.85, opacity: 0.8 }}
              animate={{ scale: [0.95, 1.35, 1.65], opacity: [0.7, 0.35, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
              className={`absolute ${sizeMap.ringSize} rounded-full border-2 border-teal-400/80 pointer-events-none`}
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0.8 }}
              animate={{ scale: [0.95, 1.25, 1.45], opacity: [0.6, 0.25, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: 'easeOut' }}
              className={`absolute ${sizeMap.ringSize} rounded-full border border-cyan-300/80 pointer-events-none`}
            />
            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
          </>
        )}

        {/* PROCESSING: Subtle Cognitive Aura & Orbital Halo */}
        {state === 'PROCESSING' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className={`absolute ${sizeMap.ringSize} rounded-full border border-dashed border-teal-400/60 pointer-events-none`}
            />
            <motion.div
              animate={{ scale: [0.96, 1.08, 0.96], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-tr from-teal-500/25 via-cyan-400/20 to-indigo-500/20 rounded-full blur-xl pointer-events-none"
            />
          </>
        )}

        {/* SPEAKING: Soft Flanking Audio Wave Arcs */}
        {state === 'SPEAKING' && (
          <>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl pointer-events-none"
            />

            {/* Left Acoustic Arcs */}
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3], x: [-1, -4, -1] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="absolute -left-5 sm:-left-7 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none"
            >
              <div className="w-1.5 h-6 rounded-full bg-teal-400/80" />
              <div className="w-1.5 h-10 rounded-full bg-cyan-400" />
              <div className="w-1.5 h-6 rounded-full bg-teal-400/80" />
            </motion.div>

            {/* Right Acoustic Arcs */}
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3], x: [1, 4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              className="absolute -right-5 sm:-right-7 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none"
            >
              <div className="w-1.5 h-6 rounded-full bg-teal-400/80" />
              <div className="w-1.5 h-10 rounded-full bg-cyan-400" />
              <div className="w-1.5 h-6 rounded-full bg-teal-400/80" />
            </motion.div>
          </>
        )}

        {/* Core Avatar Character Bubble */}
        <motion.div
          animate={getHeadMotion()}
          className={`${sizeMap.container} relative rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-500 border border-teal-500/30 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-teal-950`}
        >
          {/* Subtle Ambient Vignette & Rim Light */}
          <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-black/40 pointer-events-none" />

          {/* SVG Character Rendering */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10 drop-shadow-md select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Soft Digital Character Skin Tone Gradient */}
              <linearGradient id="clSkinGrad" x1="100" y1="50" x2="100" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="55%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>

              {/* Character Hair / Digital Volume Gradient (CASE LINE Slate & Teal) */}
              <linearGradient id="clHairGrad" x1="100" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="60%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>

              {/* Minimal Tech Bust / High Collar Gradient */}
              <linearGradient id="clCollarGrad" x1="100" y1="150" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="60%" stopColor="#134E4A" />
                <stop offset="100%" stopColor="#042F2E" />
              </linearGradient>

              {/* Eyes Gradient */}
              <linearGradient id="clEyeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#115E59" />
              </linearGradient>

              {/* Cyan Neural Pulse Gradient */}
              <radialGradient id="clNeuralGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="1" />
                <stop offset="60%" stopColor="#14B8A6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Back Hair / Silhouette Layer */}
            <path
              d="M 58 85 C 58 40, 142 40, 142 85 C 142 110, 138 135, 134 140 C 120 148, 80 148, 66 140 C 62 135, 58 110, 58 85 Z"
              fill="url(#clHairGrad)"
            />

            {/* Futuristic Minimal High Collar / Bust (No Doctor Coat) */}
            <path
              d="M 52 200 C 52 170, 72 155, 88 152 L 100 162 L 112 152 C 128 155, 148 170, 148 200 Z"
              fill="url(#clCollarGrad)"
            />
            {/* Tech Collar Cyan Piping */}
            <path
              d="M 88 152 L 100 162 L 112 152"
              stroke="#2DD4BF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* CASE LINE Minimal Crest / Sensor Dot on Collar */}
            <circle cx="100" cy="176" r="3" fill="#2DD4BF" className="animate-pulse" />

            {/* Neck */}
            <path
              d="M 86 130 C 86 130, 86 150, 88 155 C 96 158, 104 158, 112 155 C 114 150, 114 130, 114 130 Z"
              fill="#CBD5E1"
            />
            {/* Soft Neck Shadow */}
            <path
              d="M 88 134 Q 100 140 112 134 Q 100 138 88 134 Z"
              fill="#94A3B8"
              opacity="0.5"
            />

            {/* Head / Face Contour */}
            <path
              d="M 68 85 C 68 55, 132 55, 132 85 C 132 115, 118 138, 100 140 C 82 138, 68 115, 68 85 Z"
              fill="url(#clSkinGrad)"
            />

            {/* Soft Cheeks Blush (Approachability) */}
            <circle cx="80" cy="118" r="8" fill="#F43F5E" opacity="0.08" />
            <circle cx="120" cy="118" r="8" fill="#F43F5E" opacity="0.08" />

            {/* Stylized Modern Front Hair Strands */}
            <path
              d="M 67 80 C 67 48, 133 48, 133 80 C 125 65, 112 60, 100 60 C 85 60, 75 66, 67 80 Z"
              fill="#1E293B"
            />
            <path
              d="M 68 76 C 75 64, 88 62, 98 64 C 88 68, 80 75, 76 84 C 72 80, 70 78, 68 76 Z"
              fill="#0D9488"
              opacity="0.6"
            />

            {/* Eyebrows */}
            {state === 'LISTENING' ? (
              // Attentive, slightly raised
              <g stroke="#334155" strokeWidth="2.2" strokeLinecap="round">
                <path d="M 76 96 Q 84 92 92 95" />
                <path d="M 108 95 Q 116 92 124 96" />
              </g>
            ) : state === 'PROCESSING' ? (
              // Thoughtful slight tilt
              <g stroke="#334155" strokeWidth="2.2" strokeLinecap="round">
                <path d="M 76 96 Q 84 94 92 97" />
                <path d="M 108 95 Q 116 92 124 96" />
              </g>
            ) : (
              // Calm, natural, warm curve
              <g stroke="#334155" strokeWidth="2.2" strokeLinecap="round">
                <path d="M 76 97 Q 84 94 92 97" />
                <path d="M 108 97 Q 116 94 124 97" />
              </g>
            )}

            {/* Eyes & Blinking Animation */}
            <g>
              {isBlinking ? (
                // Closed eyelid curve when blinking
                <>
                  <path
                    d="M 76 109 Q 84 114 92 109"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 108 109 Q 116 114 124 109"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                // Open, friendly, trustworthy eyes
                <>
                  {/* Left Eye White */}
                  <ellipse cx="84" cy="108" rx="7" ry="5.5" fill="#FFFFFF" />
                  {/* Left Iris & Pupil */}
                  <circle
                    cx={state === 'PROCESSING' ? 84.5 : state === 'LISTENING' ? 84 : 84}
                    cy={state === 'PROCESSING' ? 106.5 : 108}
                    r={state === 'LISTENING' ? 4.2 : 3.8}
                    fill="url(#clEyeGrad)"
                  />
                  {/* Left Eye Specular Highlights */}
                  <circle cx="82.5" cy="106" r="1.4" fill="#FFFFFF" />
                  <circle cx="85.5" cy="109" r="0.8" fill="#2DD4BF" opacity="0.8" />
                  {/* Left Eyelash/Lid line */}
                  <path
                    d="M 76 107 Q 84 102 92 107"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Right Eye White */}
                  <ellipse cx="116" cy="108" rx="7" ry="5.5" fill="#FFFFFF" />
                  {/* Right Iris & Pupil */}
                  <circle
                    cx={state === 'PROCESSING' ? 116.5 : state === 'LISTENING' ? 116 : 116}
                    cy={state === 'PROCESSING' ? 106.5 : 108}
                    r={state === 'LISTENING' ? 4.2 : 3.8}
                    fill="url(#clEyeGrad)"
                  />
                  {/* Right Eye Specular Highlights */}
                  <circle cx="114.5" cy="106" r="1.4" fill="#FFFFFF" />
                  <circle cx="117.5" cy="109" r="0.8" fill="#2DD4BF" opacity="0.8" />
                  {/* Right Eyelash/Lid line */}
                  <path
                    d="M 108 107 Q 116 102 124 107"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </g>

            {/* Subtle Minimal Nose */}
            <path
              d="M 98 123 Q 100 126 102 123"
              stroke="#94A3B8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Mouth / Natural Speech Articulation */}
            <path
              d={getMouthPath()}
              fill={state === 'SPEAKING' ? '#0F172A' : '#BE185D'}
              opacity={state === 'SPEAKING' ? 0.9 : 0.75}
              stroke="#BE185D"
              strokeWidth={state === 'ERROR' ? 2 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-150"
            />

            {/* Healthcare AI Neural Comm Node (Right Temple) */}
            <g className="cursor-pointer">
              {/* Outer Glow Halo */}
              <circle
                cx="134"
                cy="88"
                r="7"
                fill="url(#clNeuralGlow)"
                className={state === 'LISTENING' || state === 'SPEAKING' ? 'animate-pulse' : ''}
              />
              {/* Comm Node Outer Ring */}
              <circle cx="134" cy="88" r="4.5" fill="#0F172A" stroke="#2DD4BF" strokeWidth="1.5" />
              {/* Comm Node Status Core */}
              <circle
                cx="134"
                cy="88"
                r="2.2"
                fill={
                  state === 'LISTENING'
                    ? '#2DD4BF'
                    : state === 'PROCESSING'
                    ? '#818CF8'
                    : state === 'SPEAKING'
                    ? '#34D399'
                    : state === 'ERROR'
                    ? '#F59E0B'
                    : '#2DD4BF'
                }
              />
            </g>

            {/* Specular Shimmer / Glass Sheen Overlay */}
            <path
              d="M 68 85 C 68 60, 100 55, 100 55 C 100 55, 75 70, 72 95 Z"
              fill="#FFFFFF"
              opacity="0.12"
            />
          </svg>

          {/* Floating Small Microphone Badge for LISTENING state */}
          <AnimatePresence>
            {state === 'LISTENING' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-md border border-teal-200"
                title="Microphone Active"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Small Sparkles Badge for PROCESSING state */}
          <AnimatePresence>
            {state === 'PROCESSING' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md border border-indigo-300"
                title="Reasoning"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Small Volume Badge for SPEAKING state */}
          <AnimatePresence>
            {state === 'SPEAKING' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md border border-emerald-200"
                title="Speaking"
              >
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Small Alert Badge for ERROR state */}
          <AnimatePresence>
            {state === 'ERROR' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md border border-amber-200"
                title="Microphone Inactive"
              >
                <AlertCircle className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Speech Bubble (when provided) */}
      {speechBubbleText && (
        <div className="relative mt-3 max-w-xs sm:max-w-sm bg-white rounded-2xl p-3.5 sm:p-4 border border-teal-200/90 shadow-md text-slate-800 text-xs sm:text-sm leading-relaxed text-left">
          {/* Bubble tail pointing to avatar */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-teal-200/90 rotate-45" />
          <div className="relative z-10 flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              {speechBubbleTitle && (
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                  {speechBubbleTitle}
                </span>
              )}
              <p className="text-slate-800 font-medium">{speechBubbleText}</p>
            </div>
          </div>
        </div>
      )}

      {/* State Badge Below */}
      {showStatusPill && (
        <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 border border-slate-700/80 text-[11px] font-semibold text-slate-200 shadow-sm backdrop-blur-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'LISTENING'
                ? 'bg-teal-400 animate-ping'
                : state === 'PROCESSING'
                ? 'bg-indigo-400 animate-pulse'
                : state === 'SPEAKING'
                ? 'bg-emerald-400 animate-pulse'
                : state === 'ERROR'
                ? 'bg-amber-400'
                : 'bg-teal-400'
            }`}
          />
          <span className="font-bold">
            {state === 'LISTENING'
              ? 'Listening to Patient...'
              : state === 'PROCESSING'
              ? 'Analyzing Symptoms...'
              : state === 'SPEAKING'
              ? 'Speaking...'
              : state === 'ERROR'
              ? 'Mic Inactive — Tap or Use Text'
              : 'Tap Avatar or Mic to Speak'}
          </span>
          <span className="text-teal-400/90 font-medium">({languageName})</span>
        </div>
      )}
    </div>
  );
};
