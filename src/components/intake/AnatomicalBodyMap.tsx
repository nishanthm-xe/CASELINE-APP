import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Zap,
  Activity,
  Check,
  Info,
} from 'lucide-react';

export interface BodyRegion {
  id: string;
  name: string;
  view: 'front' | 'back' | 'both';
  category: 'head' | 'torso' | 'limbs' | 'back';
}

export const BODY_REGIONS: BodyRegion[] = [
  { id: 'head_forehead', name: 'Head / Forehead', view: 'front', category: 'head' },
  { id: 'neck_throat', name: 'Neck / Throat', view: 'front', category: 'head' },
  { id: 'chest_retrosternal', name: 'Retrosternal Chest / Heart', view: 'front', category: 'torso' },
  { id: 'abdomen_epigastric', name: 'Upper Abdomen (Epigastric)', view: 'front', category: 'torso' },
  { id: 'abdomen_rlq', name: 'Right Lower Abdomen (Appendix)', view: 'front', category: 'torso' },
  { id: 'abdomen_llq', name: 'Left Lower Abdomen', view: 'front', category: 'torso' },
  { id: 'pelvis_groin', name: 'Pelvis / Groin', view: 'front', category: 'torso' },
  { id: 'shoulder_left', name: 'Left Shoulder', view: 'both', category: 'limbs' },
  { id: 'shoulder_right', name: 'Right Shoulder', view: 'both', category: 'limbs' },
  { id: 'arm_left', name: 'Left Arm / Hand', view: 'both', category: 'limbs' },
  { id: 'arm_right', name: 'Right Arm / Hand', view: 'both', category: 'limbs' },
  { id: 'knee_left', name: 'Left Knee / Joint', view: 'both', category: 'limbs' },
  { id: 'knee_right', name: 'Right Knee / Joint', view: 'both', category: 'limbs' },
  { id: 'lower_leg_feet', name: 'Lower Legs / Ankles / Feet', view: 'both', category: 'limbs' },
  { id: 'upper_back', name: 'Upper Back / Scapula', view: 'back', category: 'back' },
  { id: 'lower_back', name: 'Lower Back (Lumbar / Spine)', view: 'back', category: 'back' },
  { id: 'neck_back', name: 'Cervical Spine / Neck (Back)', view: 'back', category: 'back' },
];

export const PAIN_CHARACTERS = [
  { id: 'sharp', label: 'Sharp / Stabbing', desc: 'Sudden, piercing like a needle', icon: Zap },
  { id: 'throbbing', label: 'Throbbing / Pulsing', desc: 'Pounding rhythmic discomfort', icon: Activity },
  { id: 'dull', label: 'Dull / Aching', desc: 'Persistent, continuous heavy ache', icon: Activity },
  { id: 'burning', label: 'Burning / Scalding', desc: 'Hot, caustic burning sensation', icon: Flame },
  { id: 'squeezing', label: 'Squeezing / Pressure', desc: 'Tight vise-like crushing pressure', icon: ShieldAlert },
  { id: 'cramping', label: 'Cramping / Spasmodic', desc: 'Twisting contraction pain', icon: Activity },
];

interface AnatomicalBodyMapProps {
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  painLevel: number;
  onSelectPainLevel: (level: number) => void;
  painCharacter?: string;
  onSelectPainCharacter?: (character: string) => void;
  className?: string;
}

export const AnatomicalBodyMap: React.FC<AnatomicalBodyMapProps> = ({
  selectedLocation,
  onSelectLocation,
  painLevel,
  onSelectPainLevel,
  painCharacter = 'dull',
  onSelectPainCharacter,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');

  const visibleRegions = BODY_REGIONS.filter(
    (r) => r.view === activeView || r.view === 'both'
  );

  const getPainColor = (level: number) => {
    if (level <= 3) return 'from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50 border-emerald-300';
    if (level <= 6) return 'from-amber-500 to-yellow-500 text-amber-700 bg-amber-50 border-amber-300';
    if (level <= 8) return 'from-orange-500 to-rose-500 text-orange-700 bg-orange-50 border-orange-300';
    return 'from-rose-600 to-red-700 text-rose-800 bg-rose-50 border-rose-400';
  };

  const getPainLabel = (level: number) => {
    if (level === 0) return 'No Pain (0)';
    if (level <= 3) return 'Mild Discomfort (1–3)';
    if (level <= 6) return 'Moderate Pain (4–6)';
    if (level <= 8) return 'Severe Pain (7–8) — Clinical Attention';
    return 'Very Severe / Critical (9–10) — Emergency Priority';
  };

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6 ${className}`}>
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Interactive Anatomical Pain Map</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Tap where you feel pain or discomfort
          </h3>
          <p className="text-xs text-slate-500">
            Selected region: <strong className="text-teal-800">{selectedLocation || 'None selected'}</strong>
          </p>
        </div>

        {/* Front / Back Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('front')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'front'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Front View
          </button>
          <button
            type="button"
            onClick={() => setActiveView('back')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'back'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Back View
          </button>
        </div>
      </div>

      {/* Main Body Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Silhouette Graphic with Interactive Region Anchors */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 relative">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {activeView === 'front' ? 'ANTERIOR (FRONT) BODY' : 'POSTERIOR (BACK) BODY'}
          </div>

          {/* SVG Human Figure */}
          <div className="relative w-44 h-80">
            <svg
              viewBox="0 0 160 320"
              className="w-full h-full drop-shadow-sm select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head */}
              <circle
                cx="80"
                cy="32"
                r="22"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('head')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() =>
                  onSelectLocation(activeView === 'front' ? 'Head / Forehead' : 'Cervical Spine / Neck (Back)')
                }
              />

              {/* Neck */}
              <rect
                x="73"
                y="54"
                width="14"
                height="16"
                rx="3"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('neck')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() =>
                  onSelectLocation(activeView === 'front' ? 'Neck / Throat' : 'Cervical Spine / Neck (Back)')
                }
              />

              {/* Chest / Upper Back */}
              <path
                d="M 50 70 L 110 70 L 105 125 L 55 125 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('chest') ||
                  selectedLocation.toLowerCase().includes('upper back')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() =>
                  onSelectLocation(activeView === 'front' ? 'Retrosternal Chest / Heart' : 'Upper Back / Scapula')
                }
              />

              {/* Abdomen / Lower Back */}
              <path
                d="M 55 125 L 105 125 L 98 175 L 62 175 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('abdomen') ||
                  selectedLocation.toLowerCase().includes('lower back')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() =>
                  onSelectLocation(
                    activeView === 'front' ? 'Upper Abdomen (Epigastric)' : 'Lower Back (Lumbar / Spine)'
                  )
                }
              />

              {/* Pelvis */}
              <path
                d="M 62 175 L 98 175 L 94 205 L 66 205 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('pelvis')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() => onSelectLocation('Pelvis / Groin')}
              />

              {/* Left Arm */}
              <path
                d="M 110 72 L 132 150 L 124 152 L 105 85 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('left arm') ||
                  selectedLocation.toLowerCase().includes('left shoulder')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() => onSelectLocation('Left Arm / Hand')}
              />

              {/* Right Arm */}
              <path
                d="M 50 72 L 28 150 L 36 152 L 55 85 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('right arm') ||
                  selectedLocation.toLowerCase().includes('right shoulder')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() => onSelectLocation('Right Arm / Hand')}
              />

              {/* Left Leg */}
              <path
                d="M 82 205 L 94 205 L 90 295 L 78 295 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('left knee') ||
                  selectedLocation.toLowerCase().includes('feet')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() => onSelectLocation('Left Knee / Joint')}
              />

              {/* Right Leg */}
              <path
                d="M 66 205 L 78 205 L 74 295 L 62 295 Z"
                className={`transition-all cursor-pointer ${
                  selectedLocation.toLowerCase().includes('right knee')
                    ? 'fill-rose-500 stroke-rose-600 stroke-2'
                    : 'fill-slate-200 hover:fill-teal-100 stroke-slate-300'
                }`}
                onClick={() => onSelectLocation('Right Knee / Joint')}
              />
            </svg>
          </div>

          <span className="text-[11px] text-slate-400 mt-2 text-center">
            Click diagram or select pills on the right
          </span>
        </div>

        {/* Region Selection Pills & Quick Toggles */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Body Regions ({activeView === 'front' ? 'Front View' : 'Back View'}):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {visibleRegions.map((region) => {
                const isSelected = selectedLocation.toLowerCase() === region.name.toLowerCase();
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => onSelectLocation(region.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{region.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pain Severity Slider (1 - 10) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pain Intensity Scale (1 to 10):
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPainColor(painLevel)}`}>
                Level {painLevel}/10
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={painLevel}
              onChange={(e) => onSelectPainLevel(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
              <span>0 (None)</span>
              <span>2 (Mild)</span>
              <span>5 (Moderate)</span>
              <span>8 (Severe)</span>
              <span className="text-rose-600">10 (Extreme)</span>
            </div>

            <div className="text-xs font-medium text-slate-600 bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{getPainLabel(painLevel)}</span>
            </div>
          </div>

          {/* Pain Character Selector */}
          {onSelectPainCharacter && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Pain Character / Sensation:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAIN_CHARACTERS.map((char) => {
                  const Icon = char.icon;
                  const isSelected = painCharacter === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => onSelectPainCharacter(char.id)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className="w-3.5 h-3.5 text-teal-600" />
                        <span className="truncate">{char.label.split(' / ')[0]}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {char.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
