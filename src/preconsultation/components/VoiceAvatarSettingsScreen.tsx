import React, { useState, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
  ArrowLeft,
  Languages,
  Bell,
  UserCheck,
  Save,
  ChevronRight,
  Search,
  Globe,
  Radio,
  Mic,
  Info,
  CheckCircle2,
  Headphones,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { LanguageOption, VoiceSettings, AvatarMood } from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import {
  SUPPORTED_LANGUAGES,
  REGIONAL_LANGUAGE_META,
  getTranslation,
} from "../data/languages";

interface VoiceAvatarSettingsScreenProps {
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  onBackToDashboard: () => void;
  onStartInterview?: () => void;
}

type RegionalZone =
  | "ALL"
  | "South India"
  | "North & Central India"
  | "West India"
  | "East & Northeast India"
  | "Pan-India";

const REGIONAL_ZONES: { id: RegionalZone; label: string; count: number }[] = [
  { id: "ALL", label: "All Regions", count: 13 },
  { id: "South India", label: "South India", count: 4 },
  { id: "North & Central India", label: "North & Central", count: 3 },
  { id: "West India", label: "West India", count: 2 },
  { id: "East & Northeast India", label: "East & Northeast", count: 3 },
  { id: "Pan-India", label: "Pan-India (English)", count: 1 },
];

export const VoiceAvatarSettingsScreen: React.FC<VoiceAvatarSettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  selectedLanguage,
  onSelectLanguage,
  onBackToDashboard,
  onStartInterview,
}) => {
  const [previewState, setPreviewState] = useState<AvatarMood>("IDLE");
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [playingCardLang, setPlayingCardLang] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<RegionalZone>("ALL");

  const t = getTranslation(selectedLanguage.name);
  const activeMeta = REGIONAL_LANGUAGE_META[selectedLanguage.code] || {
    code: selectedLanguage.code,
    region: "Pan-India",
    states: "All India",
    dialects: ["Standard", "Conversational"],
    nativeGreeting: selectedLanguage.name,
    sampleEngTranslation: selectedLanguage.samplePhrase,
  };

  const speedMultiplierMap = {
    slow: 0.8,
    normal: 1.0,
    fast: 1.25,
  };

  // Filtered list of regional languages based on search and selected zone
  const filteredRegionalLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      const meta = REGIONAL_LANGUAGE_META[lang.code];
      const matchesZone =
        selectedZone === "ALL" || (meta && meta.region === selectedZone);

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesZone;

      const matchesQuery =
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query) ||
        lang.locale.toLowerCase().includes(query) ||
        (meta && meta.states.toLowerCase().includes(query)) ||
        (meta && meta.region.toLowerCase().includes(query));

      return matchesZone && matchesQuery;
    });
  }, [searchQuery, selectedZone]);

  const handleGenderChange = (gender: "female" | "male") => {
    onUpdateSettings({ ...settings, gender });
  };

  const handleSpeedChange = (speed: "slow" | "normal" | "fast") => {
    onUpdateSettings({
      ...settings,
      speed,
      rate: speedMultiplierMap[speed],
    });
  };

  const handleToggleBilingual = () => {
    onUpdateSettings({
      ...settings,
      bilingualMode: settings.bilingualMode !== false ? false : true,
    });
  };

  const handleDialectChange = (dialect: string) => {
    onUpdateSettings({
      ...settings,
      regionalDialect: dialect,
    });
  };

  const handleToggleAutoSpeak = () => {
    onUpdateSettings({
      ...settings,
      autoSpeak: !settings.autoSpeak,
    });
  };

  const handleToggleAudioChime = () => {
    onUpdateSettings({
      ...settings,
      audioChime: !settings.audioChime,
    });
  };

  // Play sample audio for a specified language or currently selected language
  const playAudioForLanguage = (
    lang: LanguageOption,
    isCardPreview: boolean = false
  ) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const sampleText = lang.samplePhrase;
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = lang.ttsLang;
    utterance.rate = settings.rate || 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.startsWith(lang.code) &&
        (settings.gender === "female"
          ? v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("natural")
          : v.name.toLowerCase().includes("male") ||
            v.name.toLowerCase().includes("david"))
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (isCardPreview) {
      setPlayingCardLang(lang.code);
    }
    setIsPlayingSample(true);

    utterance.onend = () => {
      setIsPlayingSample(false);
      setPlayingCardLang(null);
    };
    utterance.onerror = () => {
      setIsPlayingSample(false);
      setPlayingCardLang(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onBackToDashboard();
    }, 1100);
  };

  const handleSaveAndInterview = () => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      if (onStartInterview) {
        onStartInterview();
      } else {
        onBackToDashboard();
      }
    }, 600);
  };

  return (
    <div
      id="voice-avatar-settings-screen"
      className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28"
    >
      {/* Top Header Card with Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span className="text-slate-300">•</span>
          <div className="text-xs font-bold text-slate-400">
            Patient <span className="text-slate-300">/</span>{" "}
            <span className="text-sky-700 font-black">Voice & Regional Languages</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-sky-600 animate-pulse" />
            <span>Interview Voice Engine</span>
          </span>
        </div>
      </div>

      {/* Avatar Preview in Center: Interactive avatar with live acoustic waveform */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            {settings.gender === "female" ? "Female Doctor Avatar" : "Male Doctor Avatar"}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
            {selectedLanguage.nativeName} ({selectedLanguage.locale})
          </span>
        </div>

        <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
          CaseLine AI Voice Intake Specialist
        </div>
        <p className="text-xs font-semibold text-slate-500 mb-3">
          Avatar speaks and listens in your chosen regional language during consultations
        </p>

        {/* Large Avatar dynamically responding to selected gender, mood & real-time state */}
        <div className="my-2 relative">
          <CaseLineAvatar
            size="lg"
            character={settings.gender}
            mood={isPlayingSample ? "SPEAKING" : previewState}
            pose="settings"
            showStatusBadge={true}
          />
        </div>

        {/* Real-time State Preview Controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 mb-2">
          {(
            [
              { key: "IDLE", label: "Idle (Breathing)" },
              { key: "LISTENING", label: "Listening (Acoustic Wave)" },
              { key: "PROCESSING", label: "Processing (Orbital)" },
              { key: "SPEAKING", label: "Speaking (Voice Cadence)" },
            ] as const
          ).map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setPreviewState(st.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                previewState === st.key && !isPlayingSample
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Voice Waveform Equalizer */}
        <div className="w-full max-w-xs h-9 flex items-center justify-center gap-1.5 py-1 my-2">
          {[25, 45, 75, 30, 65, 90, 50, 80, 40, 60, 35, 20].map((height, i) => (
            <span
              key={i}
              style={{
                height:
                  isPlayingSample ||
                  previewState === "SPEAKING" ||
                  previewState === "LISTENING"
                    ? `${height}%`
                    : "20%",
              }}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isPlayingSample || previewState === "SPEAKING"
                  ? "bg-teal-500 shadow-2xs"
                  : previewState === "LISTENING"
                  ? "bg-sky-500 shadow-2xs"
                  : previewState === "PROCESSING"
                  ? "bg-indigo-400"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Sample Speech Quote in Selected Regional Language */}
        <div className="w-full max-w-lg bg-sky-50/70 border border-sky-200 rounded-2xl p-3 my-2 text-center">
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
            "{selectedLanguage.samplePhrase}"
          </p>
          <p className="text-[11px] font-semibold text-sky-800 mt-1">
            {activeMeta.sampleEngTranslation}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            type="button"
            id="test-voice-audio-btn"
            onClick={() => playAudioForLanguage(selectedLanguage)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
              isPlayingSample
                ? "bg-teal-600 text-white ring-2 ring-teal-400 animate-pulse"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>
              {isPlayingSample
                ? `Speaking in ${selectedLanguage.name}...`
                : `Test Audio in ${selectedLanguage.name} (${selectedLanguage.nativeName})`}
            </span>
          </button>

          {isPlayingSample && (
            <button
              type="button"
              onClick={() => {
                if ("speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                setIsPlayingSample(false);
                setPlayingCardLang(null);
              }}
              className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: PREFERRED SPOKEN REGIONAL LANGUAGE SELECTOR FOR VOICE INTERVIEW */}
      {/* ========================================================================= */}
      <div
        id="section-preferred-regional-language"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                <Languages className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Preferred Spoken Regional Language
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Select your spoken language for the voice interview interface. CaseLine will listen to your voice and speak all medical intake questions in this regional language.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-sky-50 border border-sky-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black text-sky-900">
              Active: {selectedLanguage.nativeName} ({selectedLanguage.name})
            </span>
          </div>
        </div>

        {/* Current Selection Banner */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50/50 rounded-2xl p-4 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {selectedLanguage.flagOrIcon || selectedLanguage.code.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-slate-900 leading-none">
                  {selectedLanguage.nativeName}
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  ({selectedLanguage.name})
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-200/80 text-sky-900">
                  {activeMeta.region}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span>States: {activeMeta.states}</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[11px] text-slate-500">
                  Locale: {selectedLanguage.locale}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => playAudioForLanguage(selectedLanguage)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Hear Voice</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Regional Filter Tabs & Search Bar */}
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian regional language, script, or state (e.g., Tamil, Telugu, Hindi, Kerala, Maharashtra)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Regional Geographic Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {REGIONAL_ZONES.map((zone) => {
              const isActive = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-sky-700 text-white shadow-2xs ring-2 ring-sky-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                  }`}
                >
                  <span>{zone.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? "bg-sky-800 text-sky-100"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {zone.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Regional Language Cards Grid (Interactive Selection for Voice Interview) */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Select Language ({filteredRegionalLanguages.length} Available)
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Click any card to set voice interview language
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRegionalLanguages.map((lang) => {
              const isSelected = selectedLanguage.code === lang.code;
              const meta = REGIONAL_LANGUAGE_META[lang.code];
              const isPlayingThisCard = playingCardLang === lang.code;

              return (
                <div
                  key={lang.code}
                  id={`spoken-lang-card-${lang.code}`}
                  onClick={() => {
                    onSelectLanguage(lang);
                    playAudioForLanguage(lang, false);
                  }}
                  className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                    isSelected
                      ? "bg-sky-50/90 border-sky-500 shadow-md ring-2 ring-sky-400/40"
                      : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    {/* Top Row: Glyph badge, state region, and audio listen button */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 group-hover:bg-sky-100 group-hover:text-sky-800"
                          }`}
                        >
                          {lang.flagOrIcon || lang.code.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                          {meta?.region || "India"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Audio Test button for this specific regional language */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudioForLanguage(lang, true);
                          }}
                          title={`Listen to ${lang.name} spoken voice sample`}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isPlayingThisCard
                              ? "bg-teal-500 text-white animate-pulse shadow-2xs"
                              : "text-slate-400 hover:text-sky-700 hover:bg-sky-100"
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Sample</span>
                        </button>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Language Names */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="font-black text-base text-slate-900 leading-tight">
                          {lang.nativeName}
                        </h4>
                        <span className="text-xs font-bold text-slate-500">
                          {lang.name}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">
                        {meta?.states || "India"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer: Speech Recognition Locale Tag */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="font-mono text-slate-500">{lang.locale}</span>
                    <span
                      className={`font-semibold ${
                        isSelected ? "text-sky-700 font-black" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "✓ Active for Voice" : "Tap to Select"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRegionalLanguages.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
              <Languages className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">
                No regional languages matching "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedZone("ALL");
                }}
                className="mt-2 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
              >
                Reset filters to view all 13 Indian languages
              </button>
            </div>
          )}
        </div>

        {/* Regional Dialect & Conversational Voice Preferences */}
        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-700" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Spoken Dialect & Conversational Mode Settings
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bilingual Medical Understanding Toggle */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Bilingual Medical Code-Switching
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Understand common English clinical terms (e.g., "fever", "BP", "chest pain", "injection") spoken mixed with {selectedLanguage.name}.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.bilingualMode !== false}
                onClick={handleToggleBilingual}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 mt-0.5 ${
                  settings.bilingualMode !== false ? "bg-sky-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-md block absolute top-1 transition-transform ${
                    settings.bilingualMode !== false
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Regional Dialect Preset */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-1.5">
              <label className="text-xs font-black text-slate-900 block">
                Preferred Spoken Dialect ({selectedLanguage.name}):
              </label>
              <select
                value={settings.regionalDialect || activeMeta.dialects[0]}
                onChange={(e) => handleDialectChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {activeMeta.dialects.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">
                Optimizes speech recognition acoustic model for regional accent variations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: VOICE GENDER, SPEED & AUDIO EXPERIENCE                           */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Voice Gender Selection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Voice Avatar Gender:
            </label>
            <span className="text-xs font-bold text-slate-400">
              Adapts both speech pitch and avatar video model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="voice-gender-female-btn"
              onClick={() => handleGenderChange("female")}
              className={`p-3.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                settings.gender === "female"
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Female Voice Avatar</span>
              {settings.gender === "female" && <Check className="w-4 h-4" />}
            </button>

            <button
              type="button"
              id="voice-gender-male-btn"
              onClick={() => handleGenderChange("male")}
              className={`p-3.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                settings.gender === "male"
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Male Voice Avatar</span>
              {settings.gender === "male" && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Voice Speech Speed */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Voice Pacing / Speech Speed:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(["slow", "normal", "fast"] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                id={`voice-speed-${spd}-btn`}
                onClick={() => handleSpeedChange(spd)}
                className={`py-3 px-4 rounded-2xl text-xs font-black capitalize border transition-all cursor-pointer text-center ${
                  settings.speed === spd
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{spd} ({speedMultiplierMap[spd]}x)</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            "Slow" (0.8x) is recommended for senior patients or noisy clinic environments.
          </p>
        </div>

        {/* Voice Assist Toggles: Auto-speak & Chime */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="pr-2">
              <h5 className="text-xs font-bold text-slate-900">
                Auto-Read Questions Aloud
              </h5>
              <p className="text-[10px] text-slate-500">
                CaseLine speaks each question as it appears
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoSpeak}
              onClick={handleToggleAutoSpeak}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.autoSpeak ? "bg-sky-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-md block absolute top-0.8 transition-transform ${
                  settings.autoSpeak ? "left-5.5" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="pr-2">
              <h5 className="text-xs font-bold text-slate-900">
                Acoustic Mic Chime
              </h5>
              <p className="text-[10px] text-slate-500">
                Gentle tone when recording begins & finishes
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.audioChime}
              onClick={handleToggleAudioChime}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                settings.audioChime ? "bg-sky-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-md block absolute top-0.8 transition-transform ${
                  settings.audioChime ? "left-5.5" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Direct Interview Notice & Action Buttons */}
      <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-sky-900">
          <Info className="w-4 h-4 text-sky-700 shrink-0" />
          <span>
            Voice interview is configured to listen and respond in{" "}
            <strong>{selectedLanguage.name} ({selectedLanguage.nativeName})</strong> with automated clinical transcription.
          </span>
        </div>
      </div>

      {/* Save Settings and Start Interview Buttons */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          id="settings-save-btn"
          onClick={handleSave}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Save className="w-4 h-4 text-slate-600" />
          <span>{savedToast ? "✓ Settings Saved!" : "Save Preferences"}</span>
        </button>

        <button
          type="button"
          id="save-and-start-interview-btn"
          onClick={handleSaveAndInterview}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Mic className="w-4 h-4" />
          <span>Start Voice Interview in {selectedLanguage.nativeName} →</span>
        </button>
      </div>
    </div>
  );
};
