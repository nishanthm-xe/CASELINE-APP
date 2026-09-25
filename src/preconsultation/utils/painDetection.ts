import { PainLocationItem } from "../types";

// Pain trigger vocabulary across multiple languages and common transliterations
const PAIN_KEYWORDS = [
  "pain",
  "hurts",
  "hurting",
  "ache",
  "aching",
  "sore",
  "discomfort",
  "burning",
  "throbbing",
  "sharp pain",
  "dull ache",
  "cramp",
  "stiffness",
  "swelling",
  // Hindi / Urdu
  "dard",
  "dukh",
  "dukhna",
  "peeda",
  "दर्द",
  "दुख",
  "तकलीफ",
  // Tamil
  "vali",
  "vedhanai",
  "வலி",
  "வேதனை",
  // Telugu
  "noppi",
  "బాధ",
  "నొప్పి",
  // Kannada
  "nowu",
  "ನೋವು",
  // Malayalam
  "vedana",
  "വേദന",
  // Bengali
  "byatha",
  "ব্যথা",
  // Marathi
  "dukhne",
  "दुखणे",
  // Gujarati
  "dukhavo",
  "દુખાવો",
  // Punjabi
  "dard",
  "ਦਰਦ",
];

const BODY_PART_KEYWORDS: Record<string, string[]> = {
  upper_abdomen: [
    "stomach",
    "belly",
    "abdomen",
    "epigastric",
    "gastric",
    "acidity",
    "pet",
    "पेट",
    "vayiru",
    "വയർ",
    "വയറ്",
    "വയറു",
    "வயிறு",
    "కడుపు",
    "ಹೊಟ್ಟೆ",
  ],
  lower_abdomen: ["lower stomach", "cramps", "pelvis", "bladder", "पेल्विस"],
  chest_right: ["chest", "chhati", "marbu", "छाती", "மார்பு", "రొమ్ము", "ಎದೆ"],
  chest_left: ["heart", "left chest", "cardiac", "dhadkan", "दिल", "இதயம்"],
  head_front: [
    "head",
    "headache",
    "forehead",
    "migraine",
    "sir",
    "sar",
    "सिर",
    "matha",
    "தலை",
    "తల",
    "ತಲೆ",
    "തല",
  ],
  throat: ["throat", "gala", "thondai", "गला", "தொண்டை", "గొంతు", "ಗಂಟಲು"],
  knee_right: [
    "knee",
    "knees",
    "ghutna",
    "muttu",
    "घुटना",
    "மூட்டு",
    "మోకాలు",
    "ಮಂಡಿ",
  ],
  knee_left: ["left knee", "baayan ghutna"],
  lower_back: [
    "lower back",
    "back",
    "backache",
    "spine",
    "lumbago",
    "kamar",
    "कमर",
    "peeth",
    "पीठ",
    "இடுப்பு",
    "నడుము",
    "ಬೆನ್ನು",
  ],
  upper_back: ["upper back", "shoulder blade", "scapula"],
  shoulder_right: ["shoulder", "kandha", "thol", "कंधा", "தோள்", "భుజం"],
  shoulder_left: ["left shoulder"],
  wrist_right: ["wrist", "kalai", "कलाई", "மணிக்கட்டு"],
  foot_right: ["foot", "feet", "heel", "pair", "पैर", "பாதம்", "పాదం", "ಪಾದ"],
  lower_leg_right: ["leg", "calf", "shin", "taang", "टांग", "கால்", "కాలు", "ಕಾಲು"],
};

/**
 * Detects if the patient text or input signifies pain, discomfort, or an anatomical complaint
 */
export function isPainComplaint(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PAIN_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Extracts a suggested anatomical region if present in the text
 */
export function detectSuggestedRegion(text: string): {
  regionId?: string;
  side?: "left" | "right" | "center";
} {
  if (!text) return {};
  const lower = text.toLowerCase();

  let detectedSide: "left" | "right" | "center" = "center";
  if (lower.includes("left") || lower.includes("baayan") || lower.includes("idathu")) {
    detectedSide = "left";
  } else if (lower.includes("right") || lower.includes("daayan") || lower.includes("valathu")) {
    detectedSide = "right";
  }

  for (const [regionId, keywords] of Object.entries(BODY_PART_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return { regionId, side: detectedSide };
    }
  }

  return { side: detectedSide };
}

/**
 * Builds SOCRATES follow-up prompt questions based on confirmed pain locations
 */
export function getFollowUpQuestionsForPain(
  locations: PainLocationItem[],
  languageName: string = "English"
): { question: string; category: string }[] {
  if (!locations || locations.length === 0) return [];
  const primary = locations[0];

  const locName = primary.displayName;

  // Chest pain has acute cardiac protocol
  if (primary.region.includes("chest")) {
    if (languageName === "Hindi") {
      return [
        {
          question: `क्या यह ${locName} का दर्द आपके बाएं कंधे, बांह या जबड़े की तरफ भी फैलता है?`,
          category: "radiation",
        },
        {
          question: `क्या दर्द के साथ पसीना आना, घबराहट या सांस लेने में परेशानी हो रही है?`,
          category: "associatedSymptoms",
        },
        {
          question: `यह दर्द कब शुरू हुआ और चलने या सीढ़ियां चढ़ने पर बढ़ता है क्या?`,
          category: "onset",
        },
      ];
    }
    if (languageName === "Tamil") {
      return [
        {
          question: `இந்த ${locName} வலி உங்களின் இடது கை, தோள்பட்டை அல்லது தாடை வரை பரவுகிறதா?`,
          category: "radiation",
        },
        {
          question: `வலியுடன் சேர்ந்து வியர்த்தல் அல்லது மூச்சுத்திணறல் ஏற்படுகிறதா?`,
          category: "associatedSymptoms",
        },
      ];
    }
    return [
      {
        question: `Does this ${locName} pain radiate or spread anywhere, such as your left arm, shoulder, or jaw?`,
        category: "radiation",
      },
      {
        question: `Are you experiencing any cold sweating, shortness of breath, or dizziness along with the pain?`,
        category: "associatedSymptoms",
      },
      {
        question: `Did it start suddenly or gradually, and does physical exertion like walking make it worse?`,
        category: "aggravatingFactors",
      },
    ];
  }

  // Knee / Joint pain protocol
  if (primary.region.includes("knee") || primary.region.includes("leg") || primary.region.includes("foot")) {
    if (languageName === "Hindi") {
      return [
        {
          question: `${locName} का दर्द कब शुरू हुआ, और क्या चलने या सीढ़ियां चढ़ने पर यह बढ़ जाता है?`,
          category: "onset",
        },
        {
          question: `क्या घुटने में कोई सूजन, लालिमा, अकड़न या हाल ही में कोई चोट लगी थी?`,
          category: "character",
        },
        {
          question: `दर्द की तीव्रता 0 से 10 के पैमाने पर कितनी है, और क्या यह लगातार रहता है या आता-जाता है?`,
          category: "severity",
        },
      ];
    }
    return [
      {
        question: `When did the pain in your ${locName} begin, and does walking, bending, or putting weight on it make it worse?`,
        category: "onset",
      },
      {
        question: `Is there any visible swelling, redness, morning stiffness, or any recent twist/injury?`,
        category: "character",
      },
      {
        question: `On a scale of 0 to 10, how severe is the pain right now? Is it constant or does it come and go?`,
        category: "severity",
      },
    ];
  }

  // Abdomen / Stomach protocol
  if (primary.region.includes("abdomen") || primary.region.includes("pelvis")) {
    if (languageName === "Hindi") {
      return [
        {
          question: `${locName} का दर्द कब से है? क्या यह भोजन करने के बाद बढ़ता है या खाली पेट?`,
          category: "timing",
        },
        {
          question: `क्या इसके साथ उल्टी, मतली, पेट फूलना, बुखार या दस्त/कब्ज के लक्षण हैं?`,
          category: "associatedSymptoms",
        },
      ];
    }
    return [
      {
        question: `When did the pain in your ${locName} start? Does it get worse after eating food or on an empty stomach?`,
        category: "timing",
      },
      {
        question: `Are you having any nausea, vomiting, burning sensation, loose motions, or fever with this?`,
        category: "associatedSymptoms",
      },
      {
        question: `What does the pain feel like—is it a dull ache, sharp cramp, or burning pressure?`,
        category: "character",
      },
    ];
  }

  // Back / Spine protocol
  if (primary.region.includes("back")) {
    if (languageName === "Hindi") {
      return [
        {
          question: `${locName} का दर्द कब शुरू हुआ? क्या यह नीचे पैरों की तरफ जाता है या झनझनाहट होती है?`,
          category: "radiation",
        },
        {
          question: `क्या झुकने, भारी वजन उठाने या ज्यादा देर बैठने पर दर्द बढ़ जाता है?`,
          category: "aggravatingFactors",
        },
      ];
    }
    return [
      {
        question: `When did this ${locName} pain begin? Does the pain shoot down into your legs or cause any numbness/tingling?`,
        category: "radiation",
      },
      {
        question: `Does bending forward, prolonged sitting, or lifting weight aggravate the pain?`,
        category: "aggravatingFactors",
      },
    ];
  }

  // General SOCRATES fallback for other regions
  return [
    {
      question: `When did the pain in your ${locName} start, and did it begin suddenly or gradually?`,
      category: "onset",
    },
    {
      question: `What does the pain feel like (sharp, dull ache, burning, throbbing), and how severe is it from 0 to 10?`,
      category: "character",
    },
    {
      question: `Does anything make the pain better or worse?`,
      category: "aggravatingFactors",
    },
  ];
}
