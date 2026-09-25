import {
  TriageLevel,
  FindingPresence,
  StructuredFinding,
  PatientVitalsSummary,
  ClinicalDiscrepancy,
  SufficiencyScore,
  InterviewMessage,
  MedicalDocument,
} from "../types";

export type RedFlagSeverityLevel = "NORMAL" | "PRIORITY" | "URGENT";

export interface StructuredSymptoms {
  chiefComplaint?: string;
  painLocation?: string;
  painSeverity?: "mild" | "moderate" | "severe" | "very_severe" | string;
  painOnset?: "sudden" | "gradual" | "chronic" | string;
  painDuration?: string;
  painCharacter?: string;
  painProgression?: "rapidly_worsening" | "stable" | "improving" | string;
  radiation?: string;
  associatedSymptoms?: string[];
  breathingDifficulty?: boolean;
  breathingSeverity?: "mild" | "moderate" | "severe";
  inabilityToSpeakNormally?: boolean;
  cyanosis?: boolean;
  chestSymptoms?: boolean;
  chestPainCharacter?: string;
  neurologicalSymptoms?: boolean;
  facialDroopOrWeakness?: boolean;
  unilateralWeakness?: boolean;
  speechDifficulty?: boolean;
  suddenLossOfCoordination?: boolean;
  suddenVisionLoss?: boolean;
  headacheSeverity?: "mild" | "moderate" | "severe_thunderclap" | string;
  headacheOnset?: "sudden" | "gradual" | string;
  bleeding?: boolean;
  bleedingSeverity?: "minor" | "uncontrolled" | "severe";
  vomitingBlood?: boolean;
  coughingBlood?: boolean;
  blackTarryStool?: boolean;
  fever?: boolean;
  feverSeverity?: "mild" | "moderate" | "high";
  consciousnessChanges?: boolean;
  syncopeOrFainting?: boolean;
  confusionOrAlteredMentalState?: boolean;
  seizure?: boolean;
  allergicSymptoms?: boolean;
  angioedemaLipTongueThroat?: boolean;
  anaphylaxisSigns?: boolean;
  injuryTrauma?: boolean;
  traumaSeverity?: "minor" | "major";
  headInjuryWithLOC?: boolean;
  diaphoresis?: boolean; // profuse sweating
  severeWeakness?: boolean;
  pregnancyRelated?: boolean;
  knownConditions?: string[];
  currentMedications?: string[];
  rawText: string;
}

export interface RedFlagRule {
  id: string;
  name: string;
  category:
    | "CARDIAC"
    | "RESPIRATORY"
    | "STROKE_NEURO"
    | "CONSCIOUSNESS_SEIZURE"
    | "BLEEDING"
    | "ALLERGY_ANAPHYLAXIS"
    | "HEADACHE_NEURO"
    | "TRAUMA"
    | "ABDOMINAL"
    | "SEPSIS_INFECTION"
    | "PREGNANCY"
    | "PEDIATRIC"
    | "GENERAL";
  level: RedFlagSeverityLevel;
  triageLevel?: TriageLevel;
  displayTitle: string;
  publicSafetyAdviceEn: string;
  staffAlertReason: string;
  evaluator: (s: StructuredSymptoms, fullContext?: string) => boolean;
}

// Configurable Clinical Red-Flag Rule Engine
export const CLINICAL_RED_FLAG_RULES: RedFlagRule[] = [
  // A. CHEST / CARDIAC WARNING SIGNS
  {
    id: "CHEST_SEVERE_OR_SUDDEN",
    name: "Severe or Sudden Chest Pain",
    category: "CARDIAC",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Acute severe or sudden chest pain/pressure detected.",
    evaluator: (s) => {
      const hasChest = !!s.chestSymptoms || /chest|heart|stern|cardiac|सीने|छाती|நெஞ்சு|గుండె/i.test(s.rawText);
      const isSevereOrSudden =
        s.painSeverity === "severe" ||
        s.painSeverity === "very_severe" ||
        s.painOnset === "sudden" ||
        /severe|crushing|tight|pressure|heavy|sudden|intense| unbearable|अचानक|तीव्र|கடுமையான|తీవ్ర/i.test(s.rawText);
      return hasChest && isSevereOrSudden;
    },
  },
  {
    id: "CHEST_WITH_DYSPNEA_OR_SYNCOPE",
    name: "Chest Pain with Shortness of Breath or Syncope",
    category: "CARDIAC",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Chest discomfort with dyspnea, sweating, or syncope reported.",
    evaluator: (s) => {
      const hasChest = !!s.chestSymptoms || /chest|heart|सीने|छाती|நெஞ்சு|గుండె/i.test(s.rawText);
      const hasAssociated =
        !!s.breathingDifficulty ||
        !!s.syncopeOrFainting ||
        !!s.diaphoresis ||
        !!s.severeWeakness ||
        /breath|sweat|faint|dizzy|collapse|unconscious|सांस|पसीना|बेहोश|மூச்சு|மயக்கம்/i.test(s.rawText);
      return hasChest && hasAssociated;
    },
  },
  {
    id: "CHEST_RADIATING_PAIN",
    name: "Chest Pain Spreading to Arm, Jaw, Neck, or Back",
    category: "CARDIAC",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Chest discomfort radiating to left arm, shoulder, jaw, or back.",
    evaluator: (s) => {
      const hasChest = !!s.chestSymptoms || /chest|heart|सीने|छाती/i.test(s.rawText);
      const hasRadiation =
        !!s.radiation ||
        /arm|shoulder|jaw|neck|back|left side|बाएं हाथ|गले|कंधे/i.test(s.rawText);
      return hasChest && hasRadiation;
    },
  },
  {
    id: "CHEST_PERSISTENT_DISCOMFORT",
    name: "Persistent Chest Discomfort (Priority Triage)",
    category: "CARDIAC",
    level: "PRIORITY",
    displayTitle: "Cardiopulmonary symptoms reported.",
    publicSafetyAdviceEn: "We have informed the triage team about your symptoms while we continue.",
    staffAlertReason: "Persistent chest discomfort without immediately overt unstable markers.",
    evaluator: (s) => {
      return (
        (!!s.chestSymptoms || /chest discomfort|chest ache|mild chest/i.test(s.rawText)) &&
        !/severe|crushing|sudden|sweating|breathless/i.test(s.rawText)
      );
    },
  },

  // B. SEVERE BREATHING DIFFICULTY
  {
    id: "SEVERE_RESPIRATORY_DISTRESS",
    name: "Severe Breathing Difficulty / Inability to Speak",
    category: "RESPIRATORY",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Severe dyspnea, inability to speak normally, or rapidly worsening breathlessness.",
    evaluator: (s) => {
      const breathing = !!s.breathingDifficulty || /breath|dyspnea|gasping|choking|सांस|மூச்சு|శ్వాస/i.test(s.rawText);
      const severe =
        s.breathingSeverity === "severe" ||
        !!s.inabilityToSpeakNormally ||
        !!s.cyanosis ||
        /struggling to breathe|cannot breathe|can't breathe|unable to speak|gasping for air|blue lips|सांस नहीं ले पा/i.test(
          s.rawText
        );
      return breathing && severe;
    },
  },

  // C. STROKE-LIKE WARNING SIGNS
  {
    id: "STROKE_LIKE_NEURO_DEFICIT",
    name: "Stroke-Like Warning Signs (Face, Arm, Speech)",
    category: "STROKE_NEURO",
    level: "URGENT",
    displayTitle: "Potential neurological emergency pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Acute focal neurological deficit: facial weakness, speech difficulty, or hemiparesis.",
    evaluator: (s) => {
      const facial = !!s.facialDroopOrWeakness || /face.*weak|facial.*droop|face.*numb|चेहरा.*कमजोर|முகம்.*பலவீனம்/i.test(s.rawText);
      const speech = !!s.speechDifficulty || /cannot speak|can't speak|slurred speech|speech.*difficult|बोल नहीं पा|பேச முடிய/i.test(s.rawText);
      const weakness = !!s.unilateralWeakness || /one side.*weak|arm.*weak|leg.*weak|numbness.*side|एक तरफ.*कमजोरी/i.test(s.rawText);
      const suddenNeuro = !!s.suddenLossOfCoordination || !!s.suddenVisionLoss || /sudden vision loss|cannot walk|lost balance/i.test(s.rawText);
      return facial || speech || weakness || suddenNeuro;
    },
  },

  // D. LOSS OF CONSCIOUSNESS / SEIZURE
  {
    id: "SYNCOPE_SEIZURE_CONFUSION",
    name: "Loss of Consciousness, Seizure, or Post-Ictal Confusion",
    category: "CONSCIOUSNESS_SEIZURE",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Syncope, seizure activity, or acute post-fainting confusion reported.",
    evaluator: (s) => {
      const syncope = !!s.syncopeOrFainting || /faint|passed out|blacked out|unconscious|collapsed|बेहोश|மயக்கம்/i.test(s.rawText);
      const seizure = !!s.seizure || /seizure|convulsion|fit|मिर्गी|दौरा/i.test(s.rawText);
      const confusion = !!s.confusionOrAlteredMentalState || /confused|disoriented|भ्रमित|குழப்பம்/i.test(s.rawText);
      return (syncope && confusion) || (syncope && /repeated|again|now/i.test(s.rawText)) || seizure || (syncope && s.painSeverity === "severe");
    },
  },

  // E. SEVERE BLEEDING
  {
    id: "SEVERE_OR_UNCONTROLLED_BLEEDING",
    name: "Severe or Uncontrolled Bleeding / Hematemesis / Hemoptysis",
    category: "BLEEDING",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Uncontrolled hemorrhage, hematemesis, hemoptysis, or concerning melena.",
    evaluator: (s) => {
      return (
        !!s.vomitingBlood ||
        !!s.coughingBlood ||
        s.bleedingSeverity === "uncontrolled" ||
        /uncontrolled bleeding|vomiting blood|coughing blood|heavy bleeding|bleeding.*won't stop|blood in vomit|खूनी उल्टी|रक्तस्राव/i.test(
          s.rawText
        )
      );
    },
  },

  // F. SEVERE ALLERGIC REACTION (ANAPHYLAXIS)
  {
    id: "ANAPHYLAXIS_ANGIOEDEMA",
    name: "Severe Allergic Reaction / Angioedema / Airway Threat",
    category: "ALLERGY_ANAPHYLAXIS",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Airway swelling (lips/tongue/throat) with respiratory compromise or rapid progression.",
    evaluator: (s) => {
      const airwaySwelling =
        !!s.angioedemaLipTongueThroat ||
        /swelling.*(lip|tongue|throat)|swollen.*(lip|tongue|throat)|lips.*tongue.*swell|throat.*closing|गला घुट|होंठ सूज/i.test(
          s.rawText
        );
      const breathingOrAllergy =
        !!s.breathingDifficulty ||
        !!s.allergicSymptoms ||
        /breath|struggling to breathe|rash|hives|allergy|एलर्जी|सांस/i.test(s.rawText);
      return airwaySwelling || (breathingOrAllergy && /rapidly worsening allergy|anaphylaxis/i.test(s.rawText));
    },
  },

  // G. SEVERE SUDDEN HEADACHE / THUNDERCLAP
  {
    id: "THUNDERCLAP_HEADACHE",
    name: "Sudden Severe Headache / Thunderclap Headache",
    category: "HEADACHE_NEURO",
    level: "URGENT",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Sudden severe headache (thunderclap) or headache accompanied by neurological deficit/confusion.",
    evaluator: (s) => {
      const isHeadache = /headache|head pain|सिरदर्द|தலைவலி/i.test(s.rawText);
      const isThunderclapOrNeuro =
        /thunderclap|worst headache|sudden.*severe headache|headache.*(vomit|vision|weakness|confusion)|अचानक तेज सिरदर्द/i.test(
          s.rawText
        );
      return isHeadache && isThunderclapOrNeuro;
    },
  },

  // H. SERIOUS TRAUMA
  {
    id: "SERIOUS_TRAUMA_OR_HEAD_INJURY",
    name: "Major Trauma or Head Injury with Complications",
    category: "TRAUMA",
    level: "URGENT",
    triageLevel: "EMERGENCY",
    displayTitle: "Potential urgent symptom pattern detected.",
    publicSafetyAdviceEn: "Your symptoms may need urgent medical attention. Please stay here. A healthcare staff member will assist you.",
    staffAlertReason: "Major trauma, head injury with LOC, or heavy bleeding following injury.",
    evaluator: (s) => {
      const trauma = !!s.injuryTrauma || /accident|injury|fall|crash|चोट|दुर्घटना/i.test(s.rawText);
      const serious =
        !!s.headInjuryWithLOC ||
        /head injury.*unconscious|lost consciousness after|severe bleeding after|cannot move|major injury/i.test(
          s.rawText
        );
      return trauma && serious;
    },
  },

  // I. SEVERE ACUTE ABDOMEN
  {
    id: "SEVERE_ACUTE_ABDOMEN",
    name: "Severe Acute Abdomen (Guarding, Rigidity, Peritoneal signs)",
    category: "ABDOMINAL",
    level: "PRIORITY",
    triageLevel: "URGENT_CARE",
    displayTitle: "Concerning acute abdominal presentation detected.",
    publicSafetyAdviceEn: "Your abdominal symptoms require urgent in-person evaluation. Clinical staff have been alerted.",
    staffAlertReason: "Severe acute abdominal pain with guarding, vomiting, high fever, or rebound tenderness.",
    evaluator: (s) => {
      const isAbdominal = /abdomen|stomach|belly|flank|epigastric|पेट|വയർ/i.test(s.rawText);
      const isSevere =
        s.painSeverity === "severe" ||
        s.painSeverity === "very_severe" ||
        /severe stomach|unbearable pain|rigid|board-like|guarding|can't touch|screaming.*pain|vomiting repeatedly/i.test(
          s.rawText
        );
      const hasPeritoneal = /fever|vomit|tender|swollen|distended|rebound/i.test(s.rawText);
      return isAbdominal && isSevere && hasPeritoneal;
    },
  },

  // J. SEVERE INFECTION / SEPSIS / MENINGISM
  {
    id: "SEPSIS_MENINGISM_FEVER",
    name: "High Fever with Neck Stiffness or Altered Sensorium (Meningism / Sepsis)",
    category: "SEPSIS_INFECTION",
    level: "URGENT",
    triageLevel: "EMERGENCY",
    displayTitle: "Potential urgent infectious emergency pattern detected.",
    publicSafetyAdviceEn: "High fever accompanied by neurological signs requires immediate medical attention. Please notify staff.",
    staffAlertReason: "High fever with neck stiffness, photophobia, confusion, or purpuric rash.",
    evaluator: (s) => {
      const isFever = !!s.fever || /fever|chills|high temp|बुखार|காய்ச்சல்|జ్వరం/i.test(s.rawText);
      const hasMeningeal =
        /stiff neck|neck.*stiff|cannot bend neck|light hurts eyes|photophobia|purple spots|petechial|delirious|very confused/i.test(
          s.rawText
        );
      return isFever && hasMeningeal;
    },
  },

  // K. PREGNANCY-RELATED EMERGENCY
  {
    id: "PREGNANCY_ACUTE_EMERGENCY",
    name: "Pregnancy with Severe Abdominal Pain, Bleeding, or Headache (Ectopic / Pre-eclampsia)",
    category: "PREGNANCY",
    level: "URGENT",
    triageLevel: "EMERGENCY",
    displayTitle: "Potential obstetric emergency detected.",
    publicSafetyAdviceEn: "Pregnancy-related symptoms require immediate obstetric evaluation. Please seek immediate staff assistance.",
    staffAlertReason: "Active pregnancy with severe lower abdominal pain, vaginal bleeding, or severe headache/vision changes.",
    evaluator: (s) => {
      const isPregnant = !!s.pregnancyRelated || /pregnant|pregnancy|trimester|expecting|गर्भवती|கர்ப்பம்/i.test(s.rawText);
      const hasDangerSigns =
        /bleeding|spotting|severe pain|cramping|convulsion|headache.*vision|blurry vision|high bp/i.test(
          s.rawText
        );
      return isPregnant && hasDangerSigns;
    },
  },

  // L. PEDIATRIC RESPIRATORY OR LETHARGY EMERGENCY
  {
    id: "PEDIATRIC_ACUTE_DISTRESS",
    name: "Pediatric Respiratory Distress, Stridor, or Lethargy",
    category: "PEDIATRIC",
    level: "URGENT",
    triageLevel: "EMERGENCY",
    displayTitle: "Pediatric urgent warning signs detected.",
    publicSafetyAdviceEn: "Child exhibits concerning symptoms requiring immediate pediatrician review.",
    staffAlertReason: "Pediatric patient presenting with stridor, chest indrawing, severe lethargy, or inability to feed.",
    evaluator: (s) => {
      const isChild = /child|baby|infant|toddler|son|daughter|kid|बच्चा|குழந்தை/i.test(s.rawText);
      const isCritical =
        /chest indrawing|stridor|grunting|blue lips|not waking up|unresponsive|lethargic|won't drink|unable to feed/i.test(
          s.rawText
        );
      return isChild && isCritical;
    },
  },

  // M. PERSISTENT HIGH FEVER WITH DEHYDRATION
  {
    id: "PERSISTENT_HIGH_FEVER_DEHYDRATION",
    name: "Persistent High Fever with Dehydration (>3 days)",
    category: "SEPSIS_INFECTION",
    level: "PRIORITY",
    triageLevel: "URGENT_CARE",
    displayTitle: "Persistent fever with dehydration risk.",
    publicSafetyAdviceEn: "Persistent high fever requires urgent same-day medical review and laboratory testing.",
    staffAlertReason: "Fever > 102°F persisting over 3 days with reduced oral intake or dark urine.",
    evaluator: (s) => {
      const fever = !!s.fever || /fever|temp|बुखार/i.test(s.rawText);
      const prolonged = /3 days|4 days|5 days|week|not coming down|high fever/i.test(s.rawText);
      const dehydration = /dehydrat|no urine|dark urine|dry mouth|cannot drink|vomiting/i.test(s.rawText);
      return fever && prolonged && dehydration;
    },
  },

  // N. ACUTE SEPTIC MONOARTHRITIS
  {
    id: "ACUTE_SEPTIC_MONOARTHRITIS",
    name: "Acute Hot Swollen Joint with Inability to Bear Weight",
    category: "GENERAL",
    level: "PRIORITY",
    triageLevel: "URGENT_CARE",
    displayTitle: "Acute joint inflammation detected.",
    publicSafetyAdviceEn: "A hot, swollen, severely painful joint requires urgent physical evaluation to rule out joint infection.",
    staffAlertReason: "Acute monoarthritis with swelling, erythema, inability to bear weight, and constitutional symptoms.",
    evaluator: (s) => {
      const joint = /knee|hip|ankle|shoulder|wrist|elbow|जोड़|முட்டு/i.test(s.rawText);
      const hotSwollen = /hot|swollen|red|cannot walk|cannot bear weight|severe swelling|सूजन/i.test(s.rawText);
      const severe = s.painSeverity === "severe" || s.painSeverity === "very_severe" || /unbearable/i.test(s.rawText);
      return joint && hotSwollen && severe;
    },
  },
];

/**
 * Normalizes patient text into structured clinical symptoms using clinical regex & keyword parsing.
 * Preserves the original raw text verbatim.
 */
export function extractStructuredSymptomsFromText(
  text: string,
  contextHistory: string = ""
): StructuredSymptoms {
  const combined = `${contextHistory} ${text}`.trim();
  const lower = combined.toLowerCase();
  const rawText = text;

  // Pain Location & Severity
  let painSeverity: "mild" | "moderate" | "severe" | "very_severe" | string = "mild";
  if (/very severe|unbearable|10\/10|9\/10|excruciating/i.test(lower)) {
    painSeverity = "very_severe";
  } else if (/severe|crushing|intense|acute|high|8\/10|7\/10|తీవ్ర|कठिन/i.test(lower)) {
    painSeverity = "severe";
  } else if (/moderate|5\/10|6\/10|medium/i.test(lower)) {
    painSeverity = "moderate";
  } else if (/mild|slight|small|little|हल्का|லேசான|తేలికపాటి/i.test(lower)) {
    painSeverity = "mild";
  }

  const painOnset = /sudden|abrupt|immediate|out of nowhere|अचानक/i.test(lower)
    ? "sudden"
    : /chronic|months|years|long time/i.test(lower)
    ? "chronic"
    : "gradual";

  const breathingDifficulty =
    /breath|struggling to breathe|cannot breathe|short of breath|gasping|choking|dyspnea|सांस|மூச்சு|శ్వాస/i.test(
      lower
    );

  const inabilityToSpeakNormally =
    /cannot speak|unable to speak normally|speechless|talking is hard/i.test(lower);

  const chestSymptoms =
    /chest|substernal|angina|cardiac|heart|pressure in chest|tightness in chest|सीने|छाती|நெஞ்சு|గుండె/i.test(
      lower
    );

  const facialDroopOrWeakness =
    /face.*weak|facial.*droop|drooping face|चेहरा.*कमजोर/i.test(lower);

  const unilateralWeakness =
    /weakness on one side|one side.*weak|left arm.*weak|right arm.*weak|hemiparesis/i.test(lower);

  const speechDifficulty =
    /cannot speak|slurred speech|speech is slurred|unable to speak properly|बोल नहीं पा/i.test(lower);

  const syncopeOrFainting =
    /faint|passed out|blacked out|unconscious|syncope|collapsed|बेहोश|மயக்கம்/i.test(lower);

  const confusionOrAlteredMentalState =
    /confused|disoriented|now i am confused|altered mental|भ्रमित|குழப்பம்/i.test(lower);

  const seizure =
    /seizure|convulsion|fit|fits|मिर्गी|दौरा/i.test(lower);

  const bleeding =
    /bleed|blood|रक्त|खून|இரத்தம்/i.test(lower);

  const bleedingSeverity =
    /uncontrolled bleeding|bleeding heavily|massive blood|won't stop bleeding/i.test(lower)
      ? "uncontrolled"
      : /minor bleeding|small cut/i.test(lower)
      ? "minor"
      : "severe";

  const vomitingBlood =
    /vomiting blood|blood in vomit|hematemesis|उल्टी में खून/i.test(lower);

  const coughingBlood =
    /coughing blood|blood in cough|hemoptysis|खांसी में खून/i.test(lower);

  const angioedemaLipTongueThroat =
    /lips.*tongue.*swell|swelling.*(lip|tongue|throat)|swollen.*(lip|tongue|throat)|throat closing/i.test(lower);

  const allergicSymptoms =
    /allerg|hives|rash|itching|एलर्जी/i.test(lower);

  const diaphoresis =
    /sweat|sweating|cold sweat|perspiring|पसीना/i.test(lower);

  const severeWeakness =
    /severe weakness|extreme fatigue|cannot stand|prostrated|भारी कमजोरी/i.test(lower);

  const injuryTrauma =
    /trauma|accident|injury|hit|fall|चोट/i.test(lower);

  const headInjuryWithLOC =
    /head injury.*(unconscious|faint|black out)/i.test(lower);

  return {
    rawText,
    painSeverity,
    painOnset,
    breathingDifficulty,
    inabilityToSpeakNormally,
    chestSymptoms,
    facialDroopOrWeakness,
    unilateralWeakness,
    speechDifficulty,
    syncopeOrFainting,
    confusionOrAlteredMentalState,
    seizure,
    bleeding,
    bleedingSeverity,
    vomitingBlood,
    coughingBlood,
    angioedemaLipTongueThroat,
    allergicSymptoms,
    diaphoresis,
    severeWeakness,
    injuryTrauma,
    headInjuryWithLOC,
  };
}

/**
 * Deterministic Red-Flag Rule Engine
 * Evaluates configured rules against structured symptoms and outputs both 3-tier severity and 4-tier clinical triage.
 */
export function evaluateRedFlags(
  structuredSymptoms: StructuredSymptoms,
  fullContext?: string
): {
  level: RedFlagSeverityLevel;
  triageLevel: TriageLevel;
  score: number;
  matchedRules: string[];
  requiresHumanTriage: boolean;
  emergencyTransferRequired: boolean;
  displayTitle?: string;
  publicSafetyAdviceEn?: string;
  staffAlertReason?: string;
  suggestedDisposition: string;
} {
  const matchedUrgent: RedFlagRule[] = [];
  const matchedPriority: RedFlagRule[] = [];

  for (const rule of CLINICAL_RED_FLAG_RULES) {
    try {
      if (rule.evaluator(structuredSymptoms, fullContext)) {
        if (rule.level === "URGENT") {
          matchedUrgent.push(rule);
        } else if (rule.level === "PRIORITY") {
          matchedPriority.push(rule);
        }
      }
    } catch (e) {
      console.warn("Rule evaluation error:", rule.id, e);
    }
  }

  // 1. Check for EMERGENCY tier
  if (matchedUrgent.length > 0) {
    return {
      level: "URGENT",
      triageLevel: "EMERGENCY",
      score: 95,
      matchedRules: matchedUrgent.map((r) => r.id),
      requiresHumanTriage: true,
      emergencyTransferRequired: true,
      displayTitle: matchedUrgent[0].displayTitle,
      publicSafetyAdviceEn: matchedUrgent[0].publicSafetyAdviceEn,
      staffAlertReason: matchedUrgent.map((r) => r.staffAlertReason).join(" | "),
      suggestedDisposition: "Immediate Emergency Department / Resuscitation Bay Transfer",
    };
  }

  // 2. Check for URGENT_CARE tier
  if (matchedPriority.length > 0) {
    return {
      level: "PRIORITY",
      triageLevel: "URGENT_CARE",
      score: 70,
      matchedRules: matchedPriority.map((r) => r.id),
      requiresHumanTriage: true,
      emergencyTransferRequired: false,
      displayTitle: matchedPriority[0].displayTitle,
      publicSafetyAdviceEn: matchedPriority[0].publicSafetyAdviceEn,
      staffAlertReason: matchedPriority.map((r) => r.staffAlertReason).join(" | "),
      suggestedDisposition: "Same-Day Priority Clinical Evaluation / Urgent Care Queue",
    };
  }

  // 3. Check for SELF_CARE vs PRIMARY_CARE
  const combinedText = `${structuredSymptoms.rawText} ${fullContext || ""}`.toLowerCase();
  const isMinorTransient =
    /mild tiredness|tired after work|minor scratch|paper cut|slight throat tickle|small headache after working|mild muscle ache after gym|mild muscle soreness/i.test(
      combinedText
    ) && !/fever|chest|vomit|blood|shortness of breath|radiat/i.test(combinedText);

  if (isMinorTransient) {
    return {
      level: "NORMAL",
      triageLevel: "SELF_CARE",
      score: 15,
      matchedRules: [],
      requiresHumanTriage: false,
      emergencyTransferRequired: false,
      displayTitle: "Minor, self-limiting symptom pattern.",
      publicSafetyAdviceEn: "Symptoms appear mild. You may discuss routine self-care or pharmacist advice with your doctor.",
      suggestedDisposition: "Self-Care with Home Monitoring & Pharmacist Consult",
    };
  }

  // 4. Default to PRIMARY_CARE
  return {
    level: "NORMAL",
    triageLevel: "PRIMARY_CARE",
    score: 35,
    matchedRules: [],
    requiresHumanTriage: false,
    emergencyTransferRequired: false,
    displayTitle: "Standard outpatient consultation indicated.",
    publicSafetyAdviceEn: "Symptoms are appropriate for standard outpatient clinical evaluation.",
    suggestedDisposition: "Routine Primary Care Outpatient (OPD) Consultation",
  };
}

/**
 * Deterministic Clinical Vitals Validation & Anomaly Detection
 */
export function evaluateVitals(vitals: Partial<PatientVitalsSummary>): {
  isAbnormal: boolean;
  abnormalFlags: string[];
  severity: "NORMAL" | "PRIORITY" | "URGENT";
} {
  const flags: string[] = [];
  let severity: "NORMAL" | "PRIORITY" | "URGENT" = "NORMAL";

  // Blood Pressure
  if (vitals.bpSystolic !== undefined) {
    if (vitals.bpSystolic >= 180) {
      flags.push(`Hypertensive Crisis: Systolic ${vitals.bpSystolic} mmHg (>=180)`);
      severity = "URGENT";
    } else if (vitals.bpSystolic >= 140) {
      flags.push(`Elevated Blood Pressure: Systolic ${vitals.bpSystolic} mmHg`);
      if (severity === "NORMAL") severity = "PRIORITY";
    } else if (vitals.bpSystolic < 90) {
      flags.push(`Hypotension: Systolic ${vitals.bpSystolic} mmHg (<90)`);
      severity = "URGENT";
    }
  }

  if (vitals.bpDiastolic !== undefined) {
    if (vitals.bpDiastolic >= 120) {
      flags.push(`Hypertensive Crisis: Diastolic ${vitals.bpDiastolic} mmHg (>=120)`);
      severity = "URGENT";
    } else if (vitals.bpDiastolic >= 90) {
      flags.push(`Elevated Diastolic BP: ${vitals.bpDiastolic} mmHg`);
      if (severity === "NORMAL") severity = "PRIORITY";
    } else if (vitals.bpDiastolic < 60) {
      flags.push(`Low Diastolic BP: ${vitals.bpDiastolic} mmHg (<60)`);
      if (severity === "NORMAL") severity = "PRIORITY";
    }
  }

  // Oxygen Saturation (SpO2)
  if (vitals.spO2 !== undefined) {
    if (vitals.spO2 <= 90) {
      flags.push(`Critical Hypoxemia: SpO2 ${vitals.spO2}% (<=90%)`);
      severity = "URGENT";
    } else if (vitals.spO2 < 95) {
      flags.push(`Sub-optimal SpO2: ${vitals.spO2}% (Normal >=95%)`);
      if (severity === "NORMAL") severity = "PRIORITY";
    }
  }

  // Pulse / Heart Rate
  if (vitals.pulseRate !== undefined) {
    if (vitals.pulseRate > 130) {
      flags.push(`Severe Tachycardia: ${vitals.pulseRate} bpm`);
      severity = "URGENT";
    } else if (vitals.pulseRate > 100) {
      flags.push(`Tachycardia: ${vitals.pulseRate} bpm`);
      if (severity === "NORMAL") severity = "PRIORITY";
    } else if (vitals.pulseRate < 50) {
      flags.push(`Bradycardia: ${vitals.pulseRate} bpm (<50)`);
      if (severity === "NORMAL") severity = "PRIORITY";
    }
  }

  // Temperature
  if (vitals.temperature !== undefined) {
    const isFahrenheit = vitals.tempUnit !== "°C";
    const tempF = isFahrenheit ? vitals.temperature : (vitals.temperature * 9) / 5 + 32;

    if (tempF >= 103.5) {
      flags.push(`Hyperpyrexia: ${vitals.temperature} ${vitals.tempUnit || "°F"}`);
      severity = "URGENT";
    } else if (tempF >= 100.4) {
      flags.push(`Fever: ${vitals.temperature} ${vitals.tempUnit || "°F"}`);
      if (severity === "NORMAL") severity = "PRIORITY";
    } else if (tempF < 95.0) {
      flags.push(`Hypothermia: ${vitals.temperature} ${vitals.tempUnit || "°F"}`);
      severity = "URGENT";
    }
  }

  // Blood Glucose
  if (vitals.bloodGlucose !== undefined) {
    if (vitals.bloodGlucose < 70) {
      flags.push(`Hypoglycemia: ${vitals.bloodGlucose} mg/dL (<70)`);
      severity = "URGENT";
    } else if (vitals.bloodGlucose >= 250) {
      flags.push(`Marked Hyperglycemia: ${vitals.bloodGlucose} mg/dL (>=250)`);
      if (severity === "NORMAL") severity = "PRIORITY";
    }
  }

  return {
    isAbnormal: flags.length > 0,
    abnormalFlags: flags,
    severity,
  };
}

/**
 * Contradiction & Discrepancy Detection Engine
 * Cross-references patient transcript against uploaded documents and clinical history.
 */
export function detectContradictions(
  messages: InterviewMessage[],
  documents: MedicalDocument[],
  vitals?: PatientVitalsSummary,
  knownConditions?: string[]
): ClinicalDiscrepancy[] {
  const discrepancies: ClinicalDiscrepancy[] = [];
  const patientStatements = messages
    .filter((m) => m.sender === "patient")
    .map((m) => m.text)
    .join(" ")
    .toLowerCase();

  const docText = documents
    .map((d) => `${d.title} ${d.rawText || ""} ${d.extractedDiagnoses.join(" ")} ${d.extractedMedicines.map((m) => m.name).join(" ")}`)
    .join(" ")
    .toLowerCase();

  // Check 1: Denied Diabetes but Metformin/Insulin/HbA1c found in records
  const deniesDiabetes =
    /no diabetes|don't have sugar|no sugar|never had sugar|not diabetic|no bp or sugar/i.test(patientStatements);
  const recordHasDiabetes =
    /diabetes|metformin|glimepiride|insulin|hba1c|sugar|glycemic/i.test(docText);

  if (deniesDiabetes && recordHasDiabetes) {
    discrepancies.push({
      id: "disc-dm-1",
      type: "DENIED_CONDITION_FOUND_IN_RECORD",
      severity: "HIGH",
      description: "Patient verbally reported having no history of Diabetes, but uploaded clinical records confirm active diabetic treatment / elevated HbA1c.",
      patientStatement: "Patient stated: 'No diabetes / don't have sugar'",
      conflictingRecordSource: "Uploaded Laboratory Profile / Prescription",
      conflictingValue: "Metformin / HbA1c in records",
      reconciliationNote: "Physician should confirm whether patient was previously diagnosed or stopped medications.",
    });
  }

  // Check 2: Denied Hypertension but Telmisartan/Amlodipine in records
  const deniesHypertension =
    /no bp|don't have bp|normal blood pressure|never had hypertension|no high bp/i.test(patientStatements);
  const recordHasHypertension =
    /telmisartan|amlodipine|losartan|atenolol|hypertension|high blood pressure/i.test(docText);

  if (deniesHypertension && recordHasHypertension) {
    discrepancies.push({
      id: "disc-htn-1",
      type: "DENIED_CONDITION_FOUND_IN_RECORD",
      severity: "HIGH",
      description: "Patient reported no high blood pressure history, but antihypertensive therapy is documented on records.",
      patientStatement: "Patient reported: 'No BP / normal blood pressure'",
      conflictingRecordSource: "Past Prescription",
      conflictingValue: "Antihypertensive agents documented",
      reconciliationNote: "Verify current BP medication compliance.",
    });
  }

  // Check 3: Patient reports taking no medicines, but documents show active prescriptions
  const reportsNoMeds = /no regular medicines|no pills|don't take anything|not on medication/i.test(patientStatements);
  const docMedsCount = documents.reduce((sum, d) => sum + (d.extractedMedicines?.length || 0), 0);

  if (reportsNoMeds && docMedsCount > 0) {
    discrepancies.push({
      id: "disc-med-1",
      type: "MEDICATION_MISMATCH",
      severity: "MEDIUM",
      description: "Patient reported taking no routine medications, but uploaded prescription lists active medications.",
      patientStatement: "Patient stated they take no medications",
      conflictingRecordSource: "Document OCR",
      conflictingValue: `${docMedsCount} active medicines extracted from document`,
      reconciliationNote: "Verify if patient is non-adherent or if prescription was discontinued.",
    });
  }

  // Check 4: Patient denies breathing difficulty, but SpO2 is <= 92%
  if (vitals?.spO2 && vitals.spO2 <= 92) {
    const deniesDyspnea = /no breathing problem|breath is fine|no shortness of breath/i.test(patientStatements);
    if (deniesDyspnea) {
      discrepancies.push({
        id: "disc-spo2-1",
        type: "INVESTIGATION_CONTRADICTION",
        severity: "HIGH",
        description: "Patient denies shortness of breath, but pulse oximetry indicates hypoxemia (SpO2 <= 92%).",
        patientStatement: "Patient denied breathing difficulties",
        conflictingRecordSource: "Patient Vitals",
        conflictingValue: `SpO2: ${vitals.spO2}%`,
        reconciliationNote: "Evaluate immediately for silent hypoxemia.",
      });
    }
  }

  return discrepancies;
}

/**
 * Pertinent Positives and Pertinent Negatives Extractor
 * Produces structured finding items with explicit PRESENT (+) vs ABSENT (-) status.
 */
export function extractStructuredFindings(
  rawTranscript: string,
  hpi?: any
): StructuredFinding[] {
  const text = rawTranscript.toLowerCase();
  const findings: StructuredFinding[] = [];

  const addFinding = (
    concept: string,
    category: "symptom" | "sign" | "risk_factor" | "red_flag",
    presentRegex: RegExp,
    absentRegex: RegExp,
    snomedCode?: string
  ) => {
    if (absentRegex.test(text)) {
      findings.push({
        id: `fnd-${concept.toLowerCase().replace(/\s+/g, "-")}`,
        concept,
        category,
        status: "ABSENT",
        details: "Explicitly denied during intake interview (-)",
        source: "PATIENT_VOICE",
        confidenceScore: 0.96,
        snomedCode,
      });
    } else if (presentRegex.test(text)) {
      findings.push({
        id: `fnd-${concept.toLowerCase().replace(/\s+/g, "-")}`,
        concept,
        category,
        status: "PRESENT",
        details: "Reported as present during clinical interview (+)",
        source: "PATIENT_VOICE",
        confidenceScore: 0.95,
        snomedCode,
      });
    }
  };

  // Cardiorespiratory
  addFinding(
    "Chest Discomfort / Pressure",
    "symptom",
    /chest pain|chest pressure|heaviness|सीने में दर्द|छाती|நெஞ்சு வலி/i,
    /no chest pain|chest is fine|no pain in chest/i,
    "29857009"
  );

  addFinding(
    "Radiation to Left Arm / Jaw",
    "red_flag",
    /radiat|left arm|shoulder|jaw|back/i,
    /no radiation|does not go to arm|stays in one place/i,
    "364741007"
  );

  addFinding(
    "Dyspnea / Shortness of Breath",
    "symptom",
    /shortness of breath|breathless|struggling to breathe|difficulty breathing|सांस फूलना/i,
    /no shortness of breath|breathing is normal|no breathlessness/i,
    "267036007"
  );

  addFinding(
    "Diaphoresis / Cold Sweating",
    "symptom",
    /sweat|cold sweat|perspir|पसीना/i,
    /no sweating|not sweating|no cold sweats/i,
    "415690000"
  );

  addFinding(
    "Fever / Chills",
    "symptom",
    /fever|hot|temperature|chills|बुखार/i,
    /no fever|no chills|normal temperature/i,
    "386661006"
  );

  addFinding(
    "Cough / Hemoptysis",
    "symptom",
    /cough|coughing blood|blood in cough|खांसी/i,
    /no cough|not coughing|no blood in sputum/i,
    "49727002"
  );

  addFinding(
    "Syncope / Loss of Consciousness",
    "red_flag",
    /faint|blackout|passed out|lost consciousness|चक्कर आकर गिरना/i,
    /no fainting|did not pass out|fully awake/i,
    "271594007"
  );

  addFinding(
    "Nausea / Vomiting",
    "symptom",
    /nausea|vomit|throwing up|उल्टी/i,
    /no vomiting|no nausea|not feeling sick/i,
    "422587007"
  );

  addFinding(
    "Focal Neurological Deficit (Facial Droop / Limb Weakness)",
    "red_flag",
    /face weak|droop|arm weak|slurred|speech problem/i,
    /no weakness|can speak normally|no face droop/i,
    "62867005"
  );

  return findings;
}

/**
 * Complaint-Specific Clinical Sufficiency Evaluator
 * Verifies that the HPI contains essential OPQRST elements before clinical handover.
 */
export function evaluateComplaintSufficiency(
  chiefComplaint: string,
  hpi: any,
  messages: InterviewMessage[]
): SufficiencyScore {
  const criteriaMet: string[] = [];
  const criteriaMissing: string[] = [];

  // 1. Onset
  if (hpi?.onset && hpi.onset.length > 2 && hpi.onset !== "Unspecified") {
    criteriaMet.push("Onset (Sudden vs Gradual)");
  } else {
    criteriaMissing.push("Onset timing");
  }

  // 2. Duration / Timing
  if (hpi?.duration && hpi.duration.length > 1) {
    criteriaMet.push("Duration / Chronicity");
  } else {
    criteriaMissing.push("Duration");
  }

  // 3. Location / Radiation
  if (hpi?.location || hpi?.painLocation || hpi?.painLocations?.length) {
    criteriaMet.push("Anatomical Location & Radiation");
  } else {
    criteriaMissing.push("Exact body location");
  }

  // 4. Severity / Intensity
  if (hpi?.severity && hpi.severity.length > 2) {
    criteriaMet.push("Severity Score (Mild / Moderate / Severe)");
  } else {
    criteriaMissing.push("Pain severity");
  }

  // 5. Aggravating & Relieving Factors
  if (
    (hpi?.aggravatingFactors && hpi.aggravatingFactors !== "None noted") ||
    (hpi?.relievingFactors && hpi.relievingFactors !== "None noted")
  ) {
    criteriaMet.push("Aggravating / Relieving Factors");
  } else {
    criteriaMissing.push("Aggravating & Relieving factors");
  }

  // 6. Pertinent Red Flags Asked
  const hasAskedRedFlags = messages.some((m) => m.isRedFlag || /breath|radiat|chest|sweat|faint/i.test(m.text));
  if (hasAskedRedFlags) {
    criteriaMet.push("Core Emergency Red-Flags Screened");
  } else {
    criteriaMissing.push("Red-flag screening");
  }

  const totalCriteria = criteriaMet.length + criteriaMissing.length;
  const overallPercent = Math.round((criteriaMet.length / (totalCriteria || 1)) * 100);

  return {
    overallPercent,
    criteriaMet,
    criteriaMissing,
    isSufficientForTriage: overallPercent >= 60,
  };
}

/**
 * Automated test suite for the 8 standard clinical test cases specified in prompt
 */
export function runAutomatedRedFlagTests(): Array<{
  testId: number;
  input: string;
  expectedLevel: RedFlagSeverityLevel;
  actualLevel: RedFlagSeverityLevel;
  triageLevel: TriageLevel;
  passed: boolean;
  matchedRules: string[];
}> {
  const tests: Array<{
    id: number;
    text: string;
    expected: RedFlagSeverityLevel;
  }> = [
    { id: 1, text: "Mild headache for two days.", expected: "NORMAL" },
    { id: 2, text: "Severe chest pain with difficulty breathing.", expected: "URGENT" },
    { id: 3, text: "Suddenly my face feels weak and I cannot speak properly.", expected: "URGENT" },
    { id: 4, text: "I have a small headache after working.", expected: "NORMAL" },
    { id: 5, text: "I am having uncontrolled bleeding.", expected: "URGENT" },
    { id: 6, text: "My lips and tongue are swelling and I am struggling to breathe.", expected: "URGENT" },
    { id: 7, text: "I fainted and now I am confused.", expected: "URGENT" },
    { id: 8, text: "I have stomach pain for three days, but it is mild and unchanged.", expected: "NORMAL" },
  ];

  return tests.map((t) => {
    const symptoms = extractStructuredSymptomsFromText(t.text);
    const result = evaluateRedFlags(symptoms);
    return {
      testId: t.id,
      input: t.text,
      expectedLevel: t.expected,
      actualLevel: result.level,
      triageLevel: result.triageLevel,
      passed: result.level === t.expected,
      matchedRules: result.matchedRules,
    };
  });
}
