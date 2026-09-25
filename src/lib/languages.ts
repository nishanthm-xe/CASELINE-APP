// Multilingual Indian Language Configurations with Real Capability Matrix
// Supports all 22 languages listed in India's Eighth Schedule + English

export interface IndianLanguage {
  language: string; // language code e.g. 'ta'
  code: string; // alias
  displayName: string; // English display name e.g. 'Tamil'
  name: string; // alias
  nativeName: string; // Native script e.g. 'தமிழ்'
  speechCode: string; // BCP-47 tag e.g. 'ta-IN'
  greeting: string;
  promptQuestion: string;
  speechToTextSupported: boolean;
  textToSpeechSupported: boolean;
  aiSupported: boolean;
  isCommonlySupported: boolean;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    language: 'en',
    code: 'en',
    displayName: 'English',
    name: 'English',
    nativeName: 'English (Indian)',
    speechCode: 'en-IN',
    greeting: "Hello! I'm your Case Line voice assistant. I'll ask you a few questions to understand why you are visiting the doctor today.",
    promptQuestion: 'Why are you visiting the doctor today?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'hi',
    code: 'hi',
    displayName: 'Hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    greeting: 'नमस्ते! मैं Case Line वॉइस असिस्टेंट हूँ। आज आप डॉक्टर से मिलने क्यों आए हैं?',
    promptQuestion: 'आज आप डॉक्टर से मिलने क्यों आए हैं? आपको क्या मुख्य तकलीफ है?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'ta',
    code: 'ta',
    displayName: 'Tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    greeting: 'வணக்கம்! நான் Case Line குரல் உதவியாளர். இன்று மருத்துவரை சந்திக்க வந்த காரணத்தைப் பற்றி உங்களிடம் சில கேள்விகள் கேட்கிறேன்.',
    promptQuestion: 'இன்று நீங்கள் மருத்துவரை சந்திக்க வந்த காரணம் என்ன? உங்கள் அறிகுறிகள் என்ன?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'te',
    code: 'te',
    displayName: 'Telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    greeting: 'నమస్కారం! నేను Case Line వాయిస్ అసిస్టెంట్‌ని. ఈరోజు డాక్టర్‌ను కలవడానికి కారణం ఏమిటో తెలుసుకోవడానికి కొన్ని ప్రశ్నలు అడుగుతాను.',
    promptQuestion: 'ఈరోజు మీరు డాక్టర్‌ను ఎందుకు సంప్రదిస్తున్నారు? మీ సమస్య ఏమిటి?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'bn',
    code: 'bn',
    displayName: 'Bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    greeting: 'নমস্কার! আমি আপনার Case Line ভয়েস অ্যাসিস্ট্যান্ট। আজ আপনি কেন ডাক্তারের কাছে এসেছেন তা জানতে আমি কিছু প্রশ্ন করব।',
    promptQuestion: 'আজ আপনি ডাক্তারের কাছে কেন এসেছেন? আপনার শারীরিক সমস্যা কি?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'mr',
    code: 'mr',
    displayName: 'Marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    greeting: 'नमस्कार! मी तुमचा Case Line व्हॉइस असिस्टंट आहे. तुम्ही आज डॉक्टरांना का भेटत आहात हे समजून घेण्यासाठी मी काही प्रश्न विचारणार आहे.',
    promptQuestion: 'आज तुम्ही डॉक्टरांना भेटायला का आला आहात? तुमची मुख्य लक्षणे कोणती?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'gu',
    code: 'gu',
    displayName: 'Gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    greeting: 'નમસ્તે! હું તમારો Case Line વોઈસ આસિસ્ટન્ટ છું. આજે તમે ડૉક્ટરને કેમ મળવા આવ્યા છો તે સમજવા માટે હું કેટલાક પ્રશ્નો પૂછીશ.',
    promptQuestion: 'આજે તમે ડૉક્ટરને કેમ મળવા આવ્યા છો? તમારી મુખ્ય તકલીફ શું છે?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'kn',
    code: 'kn',
    displayName: 'Kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Case Line ಧ್ವನಿ ಸಹಾಯಕ. ನೀವು ಇಂದು ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ಕಾರಣವೇನು ಎಂದು ತಿಳಿಯಲು ಕೆಲವು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳುತ್ತೇನೆ.',
    promptQuestion: 'ಇಂದು ನೀವು ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ಕಾರಣವೇನು? ನಿಮ್ಮ ಮುಖ್ಯ ತೊಂದರೆ ಏನು?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'ml',
    code: 'ml',
    displayName: 'Malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    greeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ Case Line വോയ്സ് അസിസ്റ്റന്റാണ്. ഇന്ന് ഡോക്ടറെ കാണാൻ വന്നതിന്റെ കാരണം മനസ്സിലാക്കാൻ ഞാൻ ചില ചോദ്യങ്ങൾ ചോദിക്കാം.',
    promptQuestion: 'ഇന്ന് നിങ്ങൾ ഡോക്ടറെ കാണാൻ വന്നതിന്റെ കാരണം എന്താണ്? പ്രധാന ലക്ഷണങ്ങൾ എന്തൊക്കെ?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'pa',
    code: 'pa',
    displayName: 'Punjabi',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ Case Line ਵਾਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਡਾਕਟਰ ਨੂੰ ਮਿਲਣ ਕਿਉਂ ਆਏ ਹੋ, ਇਹ ਸਮਝਣ ਲਈ ਮੈਂ ਕੁਝ ਸਵਾਲ ਪੁੱਛਾਂਗਾ।',
    promptQuestion: 'ਅੱਜ ਤੁਸੀਂ ਡਾਕਟਰ ਨੂੰ ਕਿਉਂ ਮਿਲਣ ਆਏ ਹੋ? ਤੁਹਾਨੂੰ ਕੀ ਮੁੱਖ ਤਕਲੀਫ਼ ਹੈ?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'or',
    code: 'or',
    displayName: 'Odia',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    greeting: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ Case Line ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଆଜି ଆପଣ ଡାକ୍ତରଙ୍କୁ କାହିଁକି ଭେଟୁଛନ୍ତି ବୁଝିବା ପାଇଁ ମୁଁ କିଛି ପ୍ରଶ୍ନ ପଚାରିବି।',
    promptQuestion: 'ଆଜି ଆପଣ ଡାକ୍ତରଙ୍କୁ ଭେଟିବାକୁ କାହିଁକି ଆସିଛନ୍ତି? ଆପଣଙ୍କ ମୁଖ୍ୟ ସମସ୍ୟା କ’ଣ?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'as',
    code: 'as',
    displayName: 'Assamese',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    greeting: 'নমস্কাৰ! মই আপোনাৰ Case Line ভইচ সহায়ক। আজি আপুনি ডাক্তৰক দেখা কৰাৰ কাৰণ জানিবলৈ মই কেইটামান প্ৰশ্ন সুধিম।',
    promptQuestion: 'আজি আপুনি ডাক্তৰক কিয় দেখা কৰিবলৈ আহিছে? আপোনাৰ মূল সমস্যা কি?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'ur',
    code: 'ur',
    displayName: 'Urdu',
    name: 'Urdu',
    nativeName: 'اردو',
    speechCode: 'ur-IN',
    greeting: 'السلام علیکم! میں آپ کا Case Line وائس اسسٹنٹ ہوں۔ آج آپ ڈاکٹر کے پاس کیوں آئے ہیں، یہ جاننے کے لیے میں کچھ سوالات پوچھوں گا۔',
    promptQuestion: 'آج آپ ڈاکٹر کے پاس کیوں تشریف لائے ہیں؟ آپ کی اہم علامات کیا ہیں؟',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: true,
  },
  {
    language: 'sa',
    code: 'sa',
    displayName: 'Sanskrit',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    speechCode: 'sa-IN',
    greeting: 'नमस्कारः! अहं भवतः Case Line ध्वनि सहायकः अस्मि। अद्य भवन्तः किमर्थं वैद्यं पश्यन्ति इति ज्ञातुं कानिचन प्रश्नानि पृच्छामि।',
    promptQuestion: 'अद्य भवान् वैद्य परामर्शस्य किं कारणम् अनुभवति?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'ne',
    code: 'ne',
    displayName: 'Nepali',
    name: 'Nepali',
    nativeName: 'नेपाली',
    speechCode: 'ne-NP',
    greeting: 'नमस्ते! म तपाईंको Case Line भ्वाइस सहायक हुँ। आज तपाईं डाक्टरकहाँ किन आउनुभयो बुझ्न केही प्रश्नहरू सोध्नेछु।',
    promptQuestion: 'आज तपाईं डाक्टरकहाँ किन आउनुभएको हो? तपाईंको मुख्य समस्या के हो?',
    speechToTextSupported: true,
    textToSpeechSupported: true,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'sd',
    code: 'sd',
    displayName: 'Sindhi',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिन्धी',
    speechCode: 'sd-IN',
    greeting: 'هيلو! مان توهان جو Case Line وائس اسسٽنٽ آهيان. اڄ ڊاڪٽر سان ڇو ملڻ آيا آهيو، اهو سمجهڻ لاءِ ڪجهه سوال پڇندس.',
    promptQuestion: 'اڄ توهان ڊاڪٽر وٽ ڇو آيا آهيو؟ توهان جا مکيه مسئلا ڇا آهن؟',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'kok',
    code: 'kok',
    displayName: 'Konkani',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    speechCode: 'kok-IN',
    greeting: 'नमस्कार! हांव तुमचो Case Line व्हॉईस असिस्टंट. आयज तुमी दोतोराक कित्याक मेळटात तें समजुंक कांय प्रस्न विचारतलों.',
    promptQuestion: 'आयज तुमी दोतोराक मेळपाचें कारण कितें? तुमी कितें त्रास भोगतात?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'ks',
    code: 'ks',
    displayName: 'Kashmiri',
    name: 'Kashmiri',
    nativeName: 'کٲشُر / कॉशुर',
    speechCode: 'ks-IN',
    greeting: 'سلام! بہ چھس تُہُند Case Line وائس اسسٹنٹ۔ از ڈاکٹرس نش یُنُک کیاہ سبب چھُ، یہ زاننہ خٲطرٕ پرژھہٕ کینہہ سوال۔',
    promptQuestion: 'از ڈاکٹرس نش یُنُک کیاہ سبب چھُ؟ تُہنز اہم تکالیف کیاہ چھِ؟',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'doi',
    code: 'doi',
    displayName: 'Dogri',
    name: 'Dogri',
    nativeName: 'डोगरी',
    speechCode: 'doi-IN',
    greeting: 'नमस्ते! मैं तुंदा Case Line वाइस सहायक हां। अज्ज तुस डाक्टर गी मिलने क्यों आये ओ, एह् जानने लेई कुझ सुआल पुच्छगा।',
    promptQuestion: 'अज्ज डाक्टर गी मिलने दा केह् कारण ऐ? तुहांदियां मुख्य तकलीफें केह् न?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'mai',
    code: 'mai',
    displayName: 'Maithili',
    name: 'Maithili',
    nativeName: 'मैथिली',
    speechCode: 'mai-IN',
    greeting: 'प्रणाम! हम अहाँक Case Line भ्वाइस सहायक छी। आइ अहाँ डॉक्टर लग किएक आयल छी, से बुझबाक लेल किछु प्रश्न पुछब।',
    promptQuestion: 'आइ डॉक्टर लग आयबक मुख्य कारण की अछि? अहाँक की तकलीफ अछि?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'sat',
    code: 'sat',
    displayName: 'Santali',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    speechCode: 'sat-IN',
    greeting: 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ ᱟᱢᱟᱜ Case Line ᱨᱚᱲ ᱜᱚᱲᱚᱭᱤᱡ ᱠᱟᱹᱱᱟᱹᱧ᱾ ᱛᱮᱦᱮᱧ ᱰᱟᱠᱛᱚᱨ ᱧᱮᱞ ᱨᱮᱭᱟᱜ ᱠᱟᱨᱚᱱ ᱵᱟᱰᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱠᱩᱠᱞᱤᱧ ᱠᱩᱞᱤᱭᱮᱫ ᱢᱮᱭᱟ᱾',
    promptQuestion: 'ᱛᱮᱦᱮᱧ ᱰᱟᱠᱛᱚᱨ ᱧᱮᱞ ᱨᱮᱭᱟᱜ ᱪᱮᱫ ᱠᱟᱨᱚᱱ? ᱟᱢᱟᱜ ᱢᱩᱬᱩᱛ ᱞᱚᱠᱷᱚᱱ ᱪᱮᱫ?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'mni',
    code: 'mni',
    displayName: 'Manipuri (Meitei)',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্',
    speechCode: 'mni-IN',
    greeting: 'খুরুমজরি! ঐহাক নহাক্কী Case Line খোন্থোক্কী মতেং পাংবনি। ঙসি দাক্তর উনবা লাকপগী মরম খঙনবা ৱাহং খর হংজগে।',
    promptQuestion: 'ঙসি দাক্তর উননবা লাকপগী মরম করিনো? নহাক্কী মরুওইবা অনাবগী মতৌ করিনো?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
  {
    language: 'brx',
    code: 'brx',
    displayName: 'Bodo',
    name: 'Bodo',
    nativeName: 'बड़ो',
    speechCode: 'brx-IN',
    greeting: 'खुलुमबाय! आं नोंथांनि Case Line रावनि हेफाजाबगिरि। दिनै डाक्टरखौ लोगो हमनो फैनायनि जाहोनाव सोंथि सोंनो सानदों।',
    promptQuestion: 'दिनै डाक्टरखौ लोगो हमनो फैनायनि जाहोना मा? नोंथांनि गाहाय लक्षणफोरा मा मा?',
    speechToTextSupported: false,
    textToSpeechSupported: false,
    aiSupported: true,
    isCommonlySupported: false,
  },
];

export function getLanguageByCode(code: string): IndianLanguage {
  const normalized = (code || 'en').toLowerCase().trim();
  return (
    INDIAN_LANGUAGES.find(
      (l) =>
        l.code === normalized ||
        l.language === normalized ||
        l.speechCode.toLowerCase() === normalized ||
        l.speechCode.toLowerCase().startsWith(normalized + '-')
    ) || INDIAN_LANGUAGES[0]
  );
}

export function isBrowserSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function isMicrophoneAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
}

export function isBrowserSpeechSynthesisAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.speechSynthesis !== 'undefined';
}

export function getSupportedSpeechRecognitionLang(code: string): string {
  const lang = getLanguageByCode(code);
  return lang?.speechCode || 'en-IN';
}

// Check real runtime capability on the patient's device
export function checkActualLanguageCapabilities(langCode: string): {
  speechToTextSupported: boolean;
  textToSpeechSupported: boolean;
  aiSupported: boolean;
  reason?: string;
} {
  const lang = getLanguageByCode(langCode);
  const sttAvailableInBrowser = isBrowserSpeechRecognitionAvailable();
  const ttsAvailableInBrowser = isBrowserSpeechSynthesisAvailable();

  // Common languages supported by Web Speech API in Chrome / Edge / Android
  const browserSttSupportedLanguages = [
    'en', 'en-in', 'hi', 'hi-in', 'ta', 'ta-in', 'te', 'te-in',
    'bn', 'bn-in', 'mr', 'mr-in', 'gu', 'gu-in', 'kn', 'kn-in',
    'ml', 'ml-in', 'pa', 'pa-in', 'ur', 'ur-in', 'ne', 'ne-np'
  ];

  const sttSupported =
    sttAvailableInBrowser &&
    browserSttSupportedLanguages.includes(lang.code.toLowerCase());

  // Check if browser has an installed voice for this language
  let ttsSupported = false;
  if (ttsAvailableInBrowser && window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      ttsSupported = voices.some(
        (v) =>
          v.lang.toLowerCase() === lang.speechCode.toLowerCase() ||
          v.lang.toLowerCase().startsWith(lang.code.toLowerCase())
      );
    } else {
      // voices might not be loaded yet or browser uses default
      ttsSupported = browserSttSupportedLanguages.includes(lang.code.toLowerCase());
    }
  }

  return {
    speechToTextSupported: sttSupported,
    textToSpeechSupported: ttsSupported,
    aiSupported: true, // Server-side Gemini AI supports all 22 Eighth Schedule languages + English
    reason: !sttSupported
      ? `Voice input is currently unavailable for ${lang.displayName} on this device/browser. You can comfortably use text input instead.`
      : undefined,
  };
}
