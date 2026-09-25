import React, { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  X,
  MapPin,
  Trash2,
  Volume2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Plus
} from "lucide-react";
import { LanguageOption, PainLocationItem } from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { useLanguage } from "../context/LanguageContext";

export interface BodyRegionDef {

  id: string;
  name: string;
  category: "head" | "torso" | "upper_limb" | "lower_limb" | "back";
  side: "left" | "right" | "center" | "bilateral";
  view: "front" | "back";
  path: string;
  labelX: number;
  labelY: number;
  altKeywords?: string[];
  displayNameMap?: Record<string, string>;
}

// Translations for Body Pain Guidance in the 13 official CaseLine languages
export const BODY_MAP_LOCALES: Record<
  string,
  {
    title: string;
    subtitle: string;
    frontView: string;
    backView: string;
    patientsRight: string;
    patientsLeft: string;
    tapPrompt: string;
    confirmationPrompt: string;
    yesConfirm: string;
    changeArea: string;
    clearSelection: string;
    addAnotherArea: string;
    doneContinuing: string;
    confirmedAreas: string;
    severityLabel: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    quickSelector: string;
  }
> = {
  English: {
    title: "Where do you feel the pain?",
    subtitle: "Tap on the body figure to point out the exact location of your pain or discomfort.",
    frontView: "Front View",
    backView: "Back View",
    patientsRight: "Right Side (Your Right)",
    patientsLeft: "Left Side (Your Left)",
    tapPrompt: "Please select the area where you feel the pain.",
    confirmationPrompt: "Is this where you feel the pain?",
    yesConfirm: "Yes, Confirm Location",
    changeArea: "Change Area",
    clearSelection: "Clear All",
    addAnotherArea: "+ Add Another Pain Area",
    doneContinuing: "Confirm & Continue Interview →",
    confirmedAreas: "Selected Pain Locations",
    severityLabel: "Pain Severity (0 - 10)",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetView: "Reset",
    quickSelector: "Quick Region Selection",
  },
  Hindi: {
    title: "आपको दर्द कहाँ हो रहा है?",
    subtitle: "शरीर के चित्र पर उस हिस्से को स्पर्श करें जहाँ आपको दर्द या परेशानी महसूस हो रही है।",
    frontView: "सामने का हिस्सा (Front)",
    backView: "पीछे का हिस्सा (Back)",
    patientsRight: "दाहिनी ओर (आपकी दाईं तरफ)",
    patientsLeft: "बाईं ओर (आपकी बाईं तरफ)",
    tapPrompt: "आपको जहाँ दर्द हो रहा है, शरीर के उस हिस्से को चुनें।",
    confirmationPrompt: "क्या आपको यहीं दर्द हो रहा है?",
    yesConfirm: "हाँ, इस स्थान की पुष्टि करें",
    changeArea: "दूसरा हिस्सा चुनें",
    clearSelection: "सभी हटाएं",
    addAnotherArea: "+ दूसरा दर्द वाला हिस्सा जोड़ें",
    doneContinuing: "स्थान की पुष्टि करें और आगे बढ़ें →",
    confirmedAreas: "चुने गए दर्द के स्थान",
    severityLabel: "दर्द की तीव्रता (0 - 10)",
    zoomIn: "बड़ा करें",
    zoomOut: "छोटा करें",
    resetView: "रीसेट",
    quickSelector: "त्वरित चयन",
  },
  Tamil: {
    title: "உங்களுக்கு எங்கே வலி இருக்கிறது?",
    subtitle: "உங்களுக்கு வலி அல்லது சிரமம் உள்ள இடத்தை உடலில் தொட்டு காட்டுங்கள்.",
    frontView: "முன்புறம் (Front)",
    backView: "பின்புறம் (Back)",
    patientsRight: "வலது பக்கம் (உங்கள் வலது)",
    patientsLeft: "இடது பக்கம் (உங்கள் இடது)",
    tapPrompt: "உங்களுக்கு வலி இருக்கும் இடத்தை உடலில் தேர்வு செய்யுங்கள்.",
    confirmationPrompt: "இங்கு தான் உங்களுக்கு வலி இருக்கிறதா?",
    yesConfirm: "ஆம், உறுதிசெய்",
    changeArea: "இடத்தை மாற்று",
    clearSelection: "அனைத்தையும் நீக்கு",
    addAnotherArea: "+ மற்றொரு வலி உள்ள இடத்தை சேர்",
    doneContinuing: "உறுதிசெய்து தொடரவும் →",
    confirmedAreas: "தேர்வு செய்யப்பட்ட இடங்கள்",
    severityLabel: "வலி அளவு (0 - 10)",
    zoomIn: "பெரிதாக்கு",
    zoomOut: "சிறிதாக்கு",
    resetView: "மீட்டமை",
    quickSelector: "விரைவு தேர்வு",
  },
  Telugu: {
    title: "మీకు నొప్పి ఎక్కడ ఉంది?",
    subtitle: "మీకు నొప్పి లేదా అసౌకర్యంగా ఉన్న భాగాన్ని శరీరంపై తాకి చూపించండి.",
    frontView: "ముందు భాగం (Front)",
    backView: "వెనుక భాగం (Back)",
    patientsRight: "కుడి వైపు (మీ కుడి)",
    patientsLeft: "ఎడమ వైపు (మీ ఎడమ)",
    tapPrompt: "మీకు నొప్పి ఉన్న భాగాన్ని శరీరంపై తాకి చూపించండి.",
    confirmationPrompt: "మీకు ఇక్కడే నొప్పిగా ఉందా?",
    yesConfirm: "అవును, నిర్ధారించండి",
    changeArea: "భాగాన్ని మార్చండి",
    clearSelection: "అన్నీ తొలగించు",
    addAnotherArea: "+ మరొక నొప్పి ప్రాంతాన్ని జోడించండి",
    doneContinuing: "నిర్ధారించి ముందుకు సాగండి →",
    confirmedAreas: "ఎంచుకున్న నొప్పి స్థానాలు",
    severityLabel: "నొప్పి తీవ్రత (0 - 10)",
    zoomIn: "జూమ్ ఇన్",
    zoomOut: "జూమ్ అవుట్",
    resetView: "రీసెట్",
    quickSelector: "త్వరిత ఎంపిక",
  },
  Kannada: {
    title: "ನಿಮಗೆ ನೋವು ಎಲ್ಲಿ ಆಗುತ್ತಿದೆ?",
    subtitle: "ನಿಮಗೆ ನೋವಿರುವ ಜಾಗವನ್ನು ದೇಹದ ಚಿತ್ರದ ಮೇಲೆ ಮುಟ್ಟಿ ತೋರಿಸಿ.",
    frontView: "ಮುಂಭಾಗ (Front)",
    backView: "ಹಿಂಭಾಗ (Back)",
    patientsRight: "ಬಲ ಭಾಗ (ನಿಮ್ಮ ಬಲ)",
    patientsLeft: "ಎಡ ಭಾಗ (ನಿಮ್ಮ ಎಡ)",
    tapPrompt: "ನಿಮಗೆ ನೋವಿರುವ ಜಾಗವನ್ನು ದೇಹದ ಮೇಲೆ ಮುಟ್ಟಿ ತೋರಿಸಿ.",
    confirmationPrompt: "ನಿಮಗೆ ಇಲ್ಲೇ ನೋವಾಗುತ್ತಿದೆಯೇ?",
    yesConfirm: "ಹೌದು, ಖಚಿತಪಡಿಸಿ",
    changeArea: "ಸ್ಥಳ ಬದಲಾಯಿಸಿ",
    clearSelection: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
    addAnotherArea: "+ ಮತ್ತೊಂದು ನೋವಿನ ಜಾಗ ಸೇರಿಸಿ",
    doneContinuing: "ಖಚಿತಪಡಿಸಿ ಮುಂದುವರಿಯಿರಿ →",
    confirmedAreas: "ಆಯ್ಕೆಮಾಡಿದ ನೋವಿನ ಸ್ಥಳಗಳು",
    severityLabel: "ನೋವಿನ ತೀವ್ರತೆ (0 - 10)",
    zoomIn: "ದೊಡ್ಡದಾಗಿಸಿ",
    zoomOut: "ಚಿಕ್ಕದಾಗಿಸಿ",
    resetView: "ಮರುಹೊಂದಿಸಿ",
    quickSelector: "ತ್ವರಿತ ಆಯ್ಕೆ",
  },
  Malayalam: {
    title: "വേദന എവിടെയാണ് അനുഭവപ്പെടുന്നത്?",
    subtitle: "ശരീരത്തിൽ വേദനയുള്ള ഭാഗം തൊട്ടു കാണിക്കുക.",
    frontView: "മുൻഭാഗം (Front)",
    backView: "പിൻഭാഗം (Back)",
    patientsRight: "വലതു വശം (നിങ്ങളുടെ വലത്)",
    patientsLeft: "ഇടതു വശം (നിങ്ങളുടെ ഇടത്)",
    tapPrompt: "വേദനയുള്ള ഭാഗം ശരീരത്തിൽ തൊട്ട് തിരഞ്ഞെടുക്കുക.",
    confirmationPrompt: "ഇവിടെയാണോ നിങ്ങൾക്ക് വേദന അനുഭവപ്പെടുന്നത്?",
    yesConfirm: "അതെ, സ്ഥിരീകരിക്കുക",
    changeArea: "മാറ്റം വരുത്തുക",
    clearSelection: "എല്ലാം മായ്ക്കുക",
    addAnotherArea: "+ മറ്റൊരു ഭാഗം ചേർക്കുക",
    doneContinuing: "സ്ഥിരീകരിച്ച് തുടരുക →",
    confirmedAreas: "തിരഞ്ഞെടുത്ത ഭാഗങ്ങൾ",
    severityLabel: "വേദനയുടെ തീവ്രത (0 - 10)",
    zoomIn: "വലുതാക്കുക",
    zoomOut: "ചെറുതാക്കുക",
    resetView: "റീസെറ്റ്",
    quickSelector: "വേഗത്തിലുള്ള തിരഞ്ഞെടുപ്പ്",
  },
  Bengali: {
    title: "আপনার ব্যথা কোথায় হচ্ছে?",
    subtitle: "শরীরের চিত্রে যেখানে ব্যথা বা অস্বস্তি হচ্ছে সেখানে স্পর্শ করে দেখান।",
    frontView: "সামনের অংশ (Front)",
    backView: "পিছনের অংশ (Back)",
    patientsRight: "ডান দিক (আপনার ডান)",
    patientsLeft: "বাম দিক (আপনার বাম)",
    tapPrompt: "শরীরে যেখানে আপনার ব্যথা হচ্ছে, সেখানে স্পর্শ করে দেখান।",
    confirmationPrompt: "আপনার কি এখানেই ব্যথা হচ্ছে?",
    yesConfirm: "হ্যাঁ, নিশ্চিত করুন",
    changeArea: "অংশ পরিবর্তন করুন",
    clearSelection: "মুছে ফেলুন",
    addAnotherArea: "+ অন্য ব্যথার অংশ যোগ করুন",
    doneContinuing: "নিশ্চিত করে এগিয়ে যান →",
    confirmedAreas: "নির্বাচিত ব্যথার স্থান",
    severityLabel: "ব্যথার তীব্রতা (০ - ১০)",
    zoomIn: "বড় করুন",
    zoomOut: "ছোট করুন",
    resetView: "রিসেট",
    quickSelector: "দ্রুত নির্বাচন",
  },
  Marathi: {
    title: "तुम्हाला कुठे त्रास किंवा वेदना होत आहे?",
    subtitle: "शरीराच्या चित्रावर जिथे वेदना होत आहे त्या भागावर स्पर्श करा.",
    frontView: "पुढचा भाग (Front)",
    backView: "मागचा भाग (Back)",
    patientsRight: "उजवी बाजू (तुमची उजवी)",
    patientsLeft: "डावी बाजू (तुमची डावी)",
    tapPrompt: "तुम्हाला जिथे दुखत आहे, शरीराचा तो भाग निवडा किंवा स्पर्श करा.",
    confirmationPrompt: "तुम्हाला इथेच दुखत आहे का?",
    yesConfirm: "होय, निश्चित करा",
    changeArea: "दुसरा भाग निवडा",
    clearSelection: "सर्व साफ करा",
    addAnotherArea: "+ आणखी एक भाग जोडा",
    doneContinuing: "निश्चित करून पुढे जा →",
    confirmedAreas: "निवडलेली दुखण्याची ठिकाणे",
    severityLabel: "वेदनेची तीव्रता (० - १०)",
    zoomIn: "मोठे करा",
    zoomOut: "लहान करा",
    resetView: "रीसेट",
    quickSelector: "जलद निवड",
  },
  Gujarati: {
    title: "તમને ક્યાં દુખાવો થાય છે?",
    subtitle: "શરીરના ચિત્ર પર તે ભાગને સ્પર્શ કરો જ્યાં તમને દુખાવો થાય છે.",
    frontView: "આગળનો ભાગ (Front)",
    backView: "પાછળનો ભાગ (Back)",
    patientsRight: "જમણી બાજુ (તમારી જમણી)",
    patientsLeft: "ડાબી બાજુ (તમારી ડાબી)",
    tapPrompt: "તમને જ્યાં દુખાવો થાય છે તે શરીરના ભાગને સ્પર્શ કરીને બતાવો.",
    confirmationPrompt: "શું તમને અહીં જ દુખાવો થાય છે?",
    yesConfirm: "હા, પુષ્ટિ કરો",
    changeArea: "ભાગ બદલો",
    clearSelection: "બધું સાફ કરો",
    addAnotherArea: "+ અન્ય દુખાવાનો ભાગ ઉમેરો",
    doneContinuing: "પુષ્ટિ કરીને આગળ વધો →",
    confirmedAreas: "પસંદ કરેલા દુખાવાના સ્થળો",
    severityLabel: "દુખાવાની તીવ્રતા (૦ - ૧૦)",
    zoomIn: "મોટું કરો",
    zoomOut: "નાનું કરો",
    resetView: "રીસેટ",
    quickSelector: "ઝડપી પસંદગી",
  },
  Punjabi: {
    title: "ਤੁਹਾਨੂੰ ਦਰਦ ਕਿੱਥੇ ਹੋ ਰਿਹਾ ਹੈ?",
    subtitle: "ਸਰੀਰ ਦੇ ਚਿੱਤਰ ਉੱਤੇ ਉਸ ਹਿੱਸੇ ਨੂੰ ਛੂਹੋ ਜਿੱਥੇ ਤੁਹਾਨੂੰ ਦਰਦ ਜਾਂ ਤਕਲੀਫ਼ ਹੈ।",
    frontView: "ਸਾਹਮਣਾ ਪਾਸਾ (Front)",
    backView: "ਪਿਛਲਾ ਪਾਸਾ (Back)",
    patientsRight: "ਸੱਜਾ ਪਾਸਾ (ਤੁਹਾਡਾ ਸੱਜਾ)",
    patientsLeft: "ਖੱਬਾ ਪਾਸਾ (ਤੁਹਾਡਾ ਖੱਬਾ)",
    tapPrompt: "ਜਿੱਥੇ ਤੁਹਾਨੂੰ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ, ਸਰੀਰ ਦੇ ਉਸ ਹਿੱਸੇ ਨੂੰ ਚੁਣੋ।",
    confirmationPrompt: "ਕੀ ਤੁਹਾਨੂੰ ਇੱਥੇ ਹੀ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ?",
    yesConfirm: "ਹਾਂ, ਪੁਸ਼ਟੀ ਕਰੋ",
    changeArea: "ਹਿੱਸਾ ਬਦਲੋ",
    clearSelection: "ਸਭ ਹਟਾਓ",
    addAnotherArea: "+ ਹੋਰ ਦਰਦ ਵਾਲਾ ਹਿੱਸਾ ਜੋੜੋ",
    doneContinuing: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਅੱਗੇ ਵਧੋ →",
    confirmedAreas: "ਚੁਣੇ ਗਏ ਦਰਦ ਦੇ ਸਥਾਨ",
    severityLabel: "ਦਰਦ ਦੀ ਗੰਭੀਰਤਾ (0 - 10)",
    zoomIn: "ਵੱਡਾ ਕਰੋ",
    zoomOut: "ਛੋਟਾ ਕਰੋ",
    resetView: "ਰੀਸੈਟ",
    quickSelector: "ਤੇਜ਼ ਚੋਣ",
  },
  Odia: {
    title: "ଆପଣଙ୍କର କେଉଁଠାରେ ଯନ୍ତ୍ରଣା ହେଉଛି?",
    subtitle: "ଶରୀରର ଯେଉଁ ଅଂଶରେ ଯନ୍ତ୍ରଣା ହେଉଛି ସେହି ସ୍ଥାନକୁ ସ୍ପର୍ଶ କରନ୍ତୁ।",
    frontView: "ଆଗ ପାଖ (Front)",
    backView: "ପଛ ପାଖ (Back)",
    patientsRight: "ଡାହାଣ ପାଖ (ଆପଣଙ୍କ ଡାହାଣ)",
    patientsLeft: "ବାମ ପାଖ (ଆପଣଙ୍କ ବାମ)",
    tapPrompt: "ଆପଣଙ୍କର ଯେଉଁଠାରେ ଯନ୍ତ୍ରଣା ହେଉଛି, ଶରୀରର ସେହି ଅଂଶକୁ ସ୍ପର୍ଶ କରି ଦେଖାନ୍ତୁ।",
    confirmationPrompt: "ଆପଣଙ୍କର ଏହିଠାରେ ହିଁ ଯନ୍ତ୍ରଣା ହେଉଛି କି?",
    yesConfirm: "ହଁ, ନିଶ୍ଚିତ କରନ୍ତୁ",
    changeArea: "ଅଂଶ ବଦଳାନ୍ତୁ",
    clearSelection: "ସବୁ ହଟାନ୍ତୁ",
    addAnotherArea: "+ ଅନ୍ୟ ଯନ୍ତ୍ରଣା ସ୍ଥାନ ଯୋଡନ୍ତୁ",
    doneContinuing: "ନିଶ୍ଚିତ କରି ଆଗକୁ ବଢନ୍ତୁ →",
    confirmedAreas: "ଚୟନିତ ଯନ୍ତ୍ରଣା ସ୍ଥାନ",
    severityLabel: "ଯନ୍ତ୍ରଣାର ତୀବ୍ରତା (୦ - ୧୦)",
    zoomIn: "ବଡ଼ କରନ୍ତୁ",
    zoomOut: "ଛୋଟ କରନ୍ତୁ",
    resetView: "ରିସେଟ୍",
    quickSelector: "ଦ୍ରୁତ ଚୟନ",
  },
  Assamese: {
    title: "আপোনাৰ ক'ত বিষ হৈছে?",
    subtitle: "শৰীৰৰ ছবিত য'ত বিষ হৈছে সেই স্থান স্পৰ্শ কৰি দেখুৱাওক।",
    frontView: "আগত (Front)",
    backView: "পিছফালে (Back)",
    patientsRight: "সোঁফাল (আপোনাৰ সোঁ)",
    patientsLeft: "বাওঁফাল (আপোনাৰ বাওঁ)",
    tapPrompt: "আপোনাৰ য'ত বিষ হৈছে, শৰীৰৰ সেই অংশত স্পৰ্শ কৰি দেখুৱাওক।",
    confirmationPrompt: "আপোনাৰ এই ঠাইতে বিষ হৈছে নেকি?",
    yesConfirm: "হয়, নিশ্চিত কৰক",
    changeArea: "স্থান সলনি কৰক",
    clearSelection: "সকলো আঁতৰাওক",
    addAnotherArea: "+ আন এটা বিষৰ স্থান যোগ কৰক",
    doneContinuing: "নিশ্চিত কৰি আগবাঢ়ক →",
    confirmedAreas: "নিৰ্বাচিত বিষৰ স্থান",
    severityLabel: "বিষৰ তীব্ৰতা (০ - ১০)",
    zoomIn: "ডাঙৰ কৰক",
    zoomOut: "সৰু কৰক",
    resetView: "পুনৰ সংহতি",
    quickSelector: "দ্ৰুত নিৰ্বাচন",
  },
  Urdu: {
    title: "آپ کو درد کہاں ہو رہا ہے؟",
    subtitle: "جسم کے اس حصے کو چھوئیں جہاں آپ کو تکلیف یا درد محسوس ہو رہا ہے۔",
    frontView: "سامنے کا حصہ (Front)",
    backView: "پیچھے کا حصہ (Back)",
    patientsRight: "دائیں جانب (آپ کا دایاں)",
    patientsLeft: "بائیں جانب (آپ کا بایاں)",
    tapPrompt: "براہ کرم جسم پر وہ جگہ منتخب کریں جہاں آپ کو درد محسوس ہو رہا ہے۔",
    confirmationPrompt: "کیا آپ کو اسی جگہ درد ہو رہا ہے؟",
    yesConfirm: "ہاں، تصدیق کریں",
    changeArea: "دوسری جگہ منتخب کریں",
    clearSelection: "سب مٹائیں",
    addAnotherArea: "+ دوسری درد کی جگہ شامل کریں",
    doneContinuing: "تصدیق کریں اور آگے بڑھیں →",
    confirmedAreas: "منتخب کردہ درد کے مقامات",
    severityLabel: "درد کی شدت (0 - 10)",
    zoomIn: "بڑا کریں",
    zoomOut: "چھوٹا کریں",
    resetView: "دوبارہ ترتیب دیں",
    quickSelector: "فوری انتخاب",
  },
};

// ANATOMICAL REGIONS (Clinical SVG Map Data for Front and Back)
// Scaled on a standard 360 x 720 canvas
export const FRONT_REGIONS: BodyRegionDef[] = [
  // Head & Neck
  {
    id: "head_front",
    name: "Head / Forehead",
    category: "head",
    side: "center",
    view: "front",
    path: "M 155,50 C 155,25 205,25 205,50 C 205,65 195,78 180,80 C 165,78 155,65 155,50 Z",
    labelX: 180,
    labelY: 45,
    altKeywords: ["headache", "forehead", "sir", "thalai", "matha"],
  },
  {
    id: "face",
    name: "Face",
    category: "head",
    side: "center",
    view: "front",
    path: "M 163,65 C 163,60 197,60 197,65 C 197,80 188,96 180,98 C 172,96 163,80 163,65 Z",
    labelX: 180,
    labelY: 78,
    altKeywords: ["face", "cheeks", "jaw", "mukham", "chehra"],
  },
  {
    id: "throat",
    name: "Throat / Anterior Neck",
    category: "head",
    side: "center",
    view: "front",
    path: "M 168,98 L 192,98 L 196,122 L 164,122 Z",
    labelX: 180,
    labelY: 110,
    altKeywords: ["throat", "sore throat", "gala", "thondai"],
  },

  // Torso / Chest
  {
    id: "chest_right",
    name: "Right Chest",
    category: "torso",
    side: "right", // Patient's right -> viewer's left
    view: "front",
    path: "M 132,130 C 145,124 165,124 180,126 L 180,185 C 155,185 130,180 126,160 Z",
    labelX: 154,
    labelY: 154,
    altKeywords: ["chest", "right chest", "chhati", "marbu"],
  },
  {
    id: "chest_left",
    name: "Left Chest",
    category: "torso",
    side: "left", // Patient's left -> viewer's right
    view: "front",
    path: "M 180,126 C 195,124 215,124 228,130 L 234,160 C 230,180 205,185 180,185 Z",
    labelX: 206,
    labelY: 154,
    altKeywords: ["chest", "left chest", "heart", "chhati", "marbu"],
  },

  // Abdomen
  {
    id: "upper_abdomen",
    name: "Upper Abdomen (Epigastric)",
    category: "torso",
    side: "center",
    view: "front",
    path: "M 134,185 L 226,185 L 222,230 L 138,230 Z",
    labelX: 180,
    labelY: 206,
    altKeywords: ["stomach", "pet", "vayiru", "belly", "upper stomach", "gastric", "acidity"],
  },
  {
    id: "lower_abdomen",
    name: "Lower Abdomen (Umbilical & Pelvic)",
    category: "torso",
    side: "center",
    view: "front",
    path: "M 138,230 L 222,230 L 216,275 L 144,275 Z",
    labelX: 180,
    labelY: 252,
    altKeywords: ["lower stomach", "cramps", "bladder", "pet"],
  },
  {
    id: "pelvis",
    name: "Pelvis / Groin",
    category: "torso",
    side: "center",
    view: "front",
    path: "M 144,275 L 216,275 L 208,310 L 180,320 L 152,310 Z",
    labelX: 180,
    labelY: 295,
    altKeywords: ["groin", "pelvis", "hip bone"],
  },

  // Upper Limbs - Right (Patient's Right = Screen Left)
  {
    id: "shoulder_right",
    name: "Right Shoulder",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 132,130 C 122,126 100,132 94,146 L 110,180 L 126,160 Z",
    labelX: 110,
    labelY: 148,
    altKeywords: ["shoulder", "right shoulder", "kandha", "thol"],
  },
  {
    id: "upper_arm_right",
    name: "Right Upper Arm",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 94,146 L 110,180 L 98,225 L 80,220 L 84,175 Z",
    labelX: 94,
    labelY: 195,
    altKeywords: ["arm", "bicep", "right arm"],
  },
  {
    id: "elbow_right",
    name: "Right Elbow",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 80,220 L 98,225 L 94,248 L 74,244 Z",
    labelX: 86,
    labelY: 236,
    altKeywords: ["elbow", "right elbow", "kohni"],
  },
  {
    id: "forearm_right",
    name: "Right Forearm",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 74,244 L 94,248 L 86,300 L 66,295 Z",
    labelX: 80,
    labelY: 272,
    altKeywords: ["forearm", "arm"],
  },
  {
    id: "wrist_right",
    name: "Right Wrist",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 66,295 L 86,300 L 84,318 L 64,314 Z",
    labelX: 74,
    labelY: 308,
    altKeywords: ["wrist", "kalai", "manikkattu"],
  },
  {
    id: "hand_right",
    name: "Right Hand & Fingers",
    category: "upper_limb",
    side: "right",
    view: "front",
    path: "M 64,314 L 84,318 L 86,355 C 80,365 65,365 58,350 Z",
    labelX: 72,
    labelY: 338,
    altKeywords: ["hand", "fingers", "palm", "haath", "kai"],
  },

  // Upper Limbs - Left (Patient's Left = Screen Right)
  {
    id: "shoulder_left",
    name: "Left Shoulder",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 228,130 C 238,126 260,132 266,146 L 250,180 L 234,160 Z",
    labelX: 250,
    labelY: 148,
    altKeywords: ["shoulder", "left shoulder", "kandha", "thol"],
  },
  {
    id: "upper_arm_left",
    name: "Left Upper Arm",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 266,146 L 250,180 L 262,225 L 280,220 L 276,175 Z",
    labelX: 266,
    labelY: 195,
    altKeywords: ["arm", "left arm"],
  },
  {
    id: "elbow_left",
    name: "Left Elbow",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 280,220 L 262,225 L 266,248 L 286,244 Z",
    labelX: 274,
    labelY: 236,
    altKeywords: ["elbow", "left elbow", "kohni"],
  },
  {
    id: "forearm_left",
    name: "Left Forearm",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 286,244 L 266,248 L 274,300 L 294,295 Z",
    labelX: 280,
    labelY: 272,
    altKeywords: ["forearm", "left forearm"],
  },
  {
    id: "wrist_left",
    name: "Left Wrist",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 294,295 L 274,300 L 276,318 L 296,314 Z",
    labelX: 286,
    labelY: 308,
    altKeywords: ["wrist", "left wrist", "kalai"],
  },
  {
    id: "hand_left",
    name: "Left Hand & Fingers",
    category: "upper_limb",
    side: "left",
    view: "front",
    path: "M 296,314 L 276,318 L 274,355 C 280,365 295,365 302,350 Z",
    labelX: 288,
    labelY: 338,
    altKeywords: ["hand", "fingers", "palm", "left hand", "haath", "kai"],
  },

  // Lower Limbs - Right (Patient's Right = Screen Left)
  {
    id: "hip_right",
    name: "Right Hip",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 144,275 L 160,275 L 165,335 L 138,335 Z",
    labelX: 150,
    labelY: 305,
    altKeywords: ["hip", "right hip", "kamar"],
  },
  {
    id: "thigh_right",
    name: "Right Thigh",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 138,335 L 175,335 L 170,440 L 132,440 Z",
    labelX: 152,
    labelY: 385,
    altKeywords: ["thigh", "right thigh", "quadricep", "jaangh", "thodai"],
  },
  {
    id: "knee_right",
    name: "Right Knee",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 132,440 L 170,440 L 168,485 L 130,485 Z",
    labelX: 150,
    labelY: 462,
    altKeywords: ["knee", "right knee", "ghutna", "muttu"],
  },
  {
    id: "lower_leg_right",
    name: "Right Lower Leg (Shin)",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 130,485 L 168,485 L 162,590 L 128,590 Z",
    labelX: 146,
    labelY: 535,
    altKeywords: ["leg", "shin", "right leg", "taang", "kaal"],
  },
  {
    id: "ankle_right",
    name: "Right Ankle",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 128,590 L 162,590 L 160,620 L 126,620 Z",
    labelX: 144,
    labelY: 605,
    altKeywords: ["ankle", "right ankle", "takhna", "kanukkaal"],
  },
  {
    id: "foot_right",
    name: "Right Foot & Toes",
    category: "lower_limb",
    side: "right",
    view: "front",
    path: "M 126,620 L 160,620 L 164,660 C 158,672 120,672 116,660 Z",
    labelX: 140,
    labelY: 642,
    altKeywords: ["foot", "toes", "right foot", "pair", "paadham"],
  },

  // Lower Limbs - Left (Patient's Left = Screen Right)
  {
    id: "hip_left",
    name: "Left Hip",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 200,275 L 216,275 L 222,335 L 195,335 Z",
    labelX: 210,
    labelY: 305,
    altKeywords: ["hip", "left hip", "kamar"],
  },
  {
    id: "thigh_left",
    name: "Left Thigh",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 185,335 L 222,335 L 228,440 L 190,440 Z",
    labelX: 208,
    labelY: 385,
    altKeywords: ["thigh", "left thigh", "quadricep", "jaangh", "thodai"],
  },
  {
    id: "knee_left",
    name: "Left Knee",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 190,440 L 228,440 L 230,485 L 192,485 Z",
    labelX: 210,
    labelY: 462,
    altKeywords: ["knee", "left knee", "ghutna", "muttu"],
  },
  {
    id: "lower_leg_left",
    name: "Left Lower Leg (Shin)",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 192,485 L 230,485 L 232,590 L 198,590 Z",
    labelX: 214,
    labelY: 535,
    altKeywords: ["leg", "shin", "left leg", "taang", "kaal"],
  },
  {
    id: "ankle_left",
    name: "Left Ankle",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 198,590 L 232,590 L 234,620 L 200,620 Z",
    labelX: 216,
    labelY: 605,
    altKeywords: ["ankle", "left ankle", "takhna", "kanukkaal"],
  },
  {
    id: "foot_left",
    name: "Left Foot & Toes",
    category: "lower_limb",
    side: "left",
    view: "front",
    path: "M 200,620 L 234,620 L 244,660 C 240,672 202,672 196,660 Z",
    labelX: 220,
    labelY: 642,
    altKeywords: ["foot", "toes", "left foot", "pair", "paadham"],
  },
];

export const BACK_REGIONS: BodyRegionDef[] = [
  // Head & Neck - Back
  {
    id: "head_back",
    name: "Back of Head (Occipital)",
    category: "head",
    side: "center",
    view: "back",
    path: "M 155,50 C 155,25 205,25 205,50 C 205,75 195,85 180,88 C 165,85 155,75 155,50 Z",
    labelX: 180,
    labelY: 52,
    altKeywords: ["back of head", "occipital", "headache", "sar dard"],
  },
  {
    id: "neck_back",
    name: "Back of Neck (Cervical Spine)",
    category: "head",
    side: "center",
    view: "back",
    path: "M 166,88 L 194,88 L 198,124 L 162,124 Z",
    labelX: 180,
    labelY: 106,
    altKeywords: ["neck", "cervical", "stiff neck", "gardhan", "kazhuthu"],
  },

  // Back & Spine
  {
    id: "upper_back",
    name: "Upper Back (Interscapular)",
    category: "back",
    side: "center",
    view: "back",
    path: "M 148,126 L 212,126 L 208,185 L 152,185 Z",
    labelX: 180,
    labelY: 155,
    altKeywords: ["upper back", "spine", "peeth"],
  },
  {
    id: "scapula_left",
    name: "Left Shoulder Blade / Scapula",
    category: "back",
    side: "left", // On Back View: Patient's Left is on viewer's left
    view: "back",
    path: "M 126,130 L 148,126 L 152,185 L 124,175 Z",
    labelX: 136,
    labelY: 155,
    altKeywords: ["left upper back", "scapula", "shoulder blade"],
  },
  {
    id: "scapula_right",
    name: "Right Shoulder Blade / Scapula",
    category: "back",
    side: "right", // On Back View: Patient's Right is on viewer's right
    view: "back",
    path: "M 212,126 L 234,130 L 236,175 L 208,185 Z",
    labelX: 224,
    labelY: 155,
    altKeywords: ["right upper back", "scapula", "shoulder blade"],
  },
  {
    id: "mid_back",
    name: "Mid Back (Thoracic Spine)",
    category: "back",
    side: "center",
    view: "back",
    path: "M 134,185 L 226,185 L 222,235 L 138,235 Z",
    labelX: 180,
    labelY: 210,
    altKeywords: ["mid back", "spine", "peeth"],
  },
  {
    id: "lower_back",
    name: "Lower Back (Lumbar Spine)",
    category: "back",
    side: "center",
    view: "back",
    path: "M 138,235 L 222,235 L 216,285 L 144,285 Z",
    labelX: 180,
    labelY: 260,
    altKeywords: ["lower back", "lumbago", "slip disc", "kamar dard", "iduppu"],
  },
  {
    id: "gluteal_left",
    name: "Left Buttock / Gluteal",
    category: "back",
    side: "left",
    view: "back",
    path: "M 144,285 L 180,285 L 178,335 L 138,335 Z",
    labelX: 158,
    labelY: 310,
    altKeywords: ["buttock", "gluteal", "left hip back"],
  },
  {
    id: "gluteal_right",
    name: "Right Buttock / Gluteal",
    category: "back",
    side: "right",
    view: "back",
    path: "M 180,285 L 216,285 L 222,335 L 182,335 Z",
    labelX: 202,
    labelY: 310,
    altKeywords: ["buttock", "gluteal", "right hip back"],
  },

  // Back Upper Limbs (Left on Left, Right on Right)
  {
    id: "shoulder_back_left",
    name: "Left Posterior Shoulder",
    category: "upper_limb",
    side: "left",
    view: "back",
    path: "M 126,130 C 116,126 94,132 88,146 L 104,180 L 124,160 Z",
    labelX: 104,
    labelY: 148,
    altKeywords: ["left shoulder back"],
  },
  {
    id: "upper_arm_back_left",
    name: "Left Posterior Upper Arm",
    category: "upper_limb",
    side: "left",
    view: "back",
    path: "M 88,146 L 104,180 L 92,225 L 74,220 L 78,175 Z",
    labelX: 88,
    labelY: 195,
    altKeywords: ["left arm back", "tricep"],
  },
  {
    id: "elbow_back_left",
    name: "Left Posterior Elbow",
    category: "upper_limb",
    side: "left",
    view: "back",
    path: "M 74,220 L 92,225 L 88,248 L 68,244 Z",
    labelX: 80,
    labelY: 236,
    altKeywords: ["left elbow back"],
  },

  {
    id: "shoulder_back_right",
    name: "Right Posterior Shoulder",
    category: "upper_limb",
    side: "right",
    view: "back",
    path: "M 234,130 C 244,126 266,132 272,146 L 256,180 L 236,160 Z",
    labelX: 256,
    labelY: 148,
    altKeywords: ["right shoulder back"],
  },
  {
    id: "upper_arm_back_right",
    name: "Right Posterior Upper Arm",
    category: "upper_limb",
    side: "right",
    view: "back",
    path: "M 272,146 L 256,180 L 268,225 L 286,220 L 282,175 Z",
    labelX: 272,
    labelY: 195,
    altKeywords: ["right arm back", "tricep"],
  },
  {
    id: "elbow_back_right",
    name: "Right Posterior Elbow",
    category: "upper_limb",
    side: "right",
    view: "back",
    path: "M 286,220 L 268,225 L 272,248 L 292,244 Z",
    labelX: 280,
    labelY: 236,
    altKeywords: ["right elbow back"],
  },

  // Back Lower Limbs
  {
    id: "thigh_back_left",
    name: "Left Hamstring (Back of Thigh)",
    category: "lower_limb",
    side: "left",
    view: "back",
    path: "M 138,335 L 178,335 L 172,440 L 132,440 Z",
    labelX: 154,
    labelY: 385,
    altKeywords: ["hamstring", "left thigh back"],
  },
  {
    id: "knee_back_left",
    name: "Back of Left Knee (Popliteal)",
    category: "lower_limb",
    side: "left",
    view: "back",
    path: "M 132,440 L 172,440 L 170,485 L 130,485 Z",
    labelX: 150,
    labelY: 462,
    altKeywords: ["back of knee", "left knee back"],
  },
  {
    id: "calf_left",
    name: "Left Calf",
    category: "lower_limb",
    side: "left",
    view: "back",
    path: "M 130,485 L 170,485 L 164,590 L 126,590 Z",
    labelX: 148,
    labelY: 535,
    altKeywords: ["calf", "left calf"],
  },
  {
    id: "heel_left",
    name: "Left Heel / Sole",
    category: "lower_limb",
    side: "left",
    view: "back",
    path: "M 126,590 L 164,590 L 160,650 C 150,665 125,665 120,650 Z",
    labelX: 142,
    labelY: 625,
    altKeywords: ["heel", "sole", "left foot back", "eidi"],
  },

  {
    id: "thigh_back_right",
    name: "Right Hamstring (Back of Thigh)",
    category: "lower_limb",
    side: "right",
    view: "back",
    path: "M 182,335 L 222,335 L 228,440 L 188,440 Z",
    labelX: 206,
    labelY: 385,
    altKeywords: ["hamstring", "right thigh back"],
  },
  {
    id: "knee_back_right",
    name: "Back of Right Knee (Popliteal)",
    category: "lower_limb",
    side: "right",
    view: "back",
    path: "M 188,440 L 228,440 L 230,485 L 190,485 Z",
    labelX: 210,
    labelY: 462,
    altKeywords: ["back of knee", "right knee back"],
  },
  {
    id: "calf_right",
    name: "Right Calf",
    category: "lower_limb",
    side: "right",
    view: "back",
    path: "M 190,485 L 230,485 L 234,590 L 196,590 Z",
    labelX: 212,
    labelY: 535,
    altKeywords: ["calf", "right calf"],
  },
  {
    id: "heel_right",
    name: "Right Heel / Sole",
    category: "lower_limb",
    side: "right",
    view: "back",
    path: "M 196,590 L 234,590 L 240,650 C 235,665 210,665 200,650 Z",
    labelX: 218,
    labelY: 625,
    altKeywords: ["heel", "sole", "right foot back", "eidi"],
  },
];

const HUMAN_BODY_MODEL_PATH = "/models/caseline-human-body.glb";

const MODEL_REGION_ALIASES: Record<string, string> = {
  head: "head_front",
  forehead: "head_front",
  neck: "throat",
  chestright: "chest_right",
  chestleft: "chest_left",
  abdomenupper: "upper_abdomen",
  abdomenlower: "lower_abdomen",
  groin: "pelvis",
  rightshoulder: "shoulder_right",
  leftshoulder: "shoulder_left",
  rightupperarm: "upper_arm_right",
  leftupperarm: "upper_arm_left",
  rightelbow: "elbow_right",
  leftelbow: "elbow_left",
  rightforearm: "forearm_right",
  leftforearm: "forearm_left",
  rightwrist: "wrist_right",
  leftwrist: "wrist_left",
  righthand: "hand_right",
  lefthand: "hand_left",
  righthip: "hip_right",
  lefthip: "hip_left",
  rightthigh: "thigh_right",
  leftthigh: "thigh_left",
  rightknee: "knee_right",
  leftknee: "knee_left",
  rightlowerleg: "lower_leg_right",
  leftlowerleg: "lower_leg_left",
  rightankle: "ankle_right",
  leftankle: "ankle_left",
  rightfoot: "foot_right",
  leftfoot: "foot_left",
};

const normalizeMeshName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

const resolveMeshRegion = (object: THREE.Object3D, currentView: "front" | "back") => {
  let current: THREE.Object3D | null = object;
  const allRegions = [...FRONT_REGIONS, ...BACK_REGIONS];
  const regionById = (id: string) => allRegions.find((region) => region.id === id) || null;

  while (current) {
    const metadata = current.userData as { name?: string; nameDetail?: string; type?: string };
    const sourceName = `${current.name} ${metadata.name || ""} ${metadata.nameDetail || ""}`;
    const normalizedName = normalizeMeshName(sourceName);
    const regionId = MODEL_REGION_ALIASES[normalizedName];

    if (regionId) {
      return regionById(regionId);
    }

    current = current.parent;
  }

  const metadata = object.userData as { name?: string; nameDetail?: string; type?: string };
  if (metadata.type && metadata.type !== "muscle") return null;

  const sourceName = `${object.name} ${metadata.name || ""} ${metadata.nameDetail || ""}`.toLowerCase();
  const normalizedName = normalizeMeshName(sourceName);
  const isBackStructure = /trapezius|latissimus|rhomboid|erector|multifidus|glute|hamstring|gastrocnemius|soleus|calf|posterior|infraspinatus|teresmajor/.test(normalizedName);
  const hasRightMarker = /right|\.r(?:\.|$)/.test(sourceName);
  const hasLeftMarker = /left|\.l(?:\.|$)/.test(sourceName);
  const hasSide = hasRightMarker || hasLeftMarker || /shoulder|arm|elbow|forearm|wrist|hand|hip|thigh|knee|leg|ankle|foot|glute|calf|hamstring/.test(normalizedName);
  const worldPosition = new THREE.Vector3();
  object.getWorldPosition(worldPosition);
  const side: BodyRegionDef["side"] = hasRightMarker
    ? "right"
    : hasLeftMarker
    ? "left"
    : hasSide
    ? worldPosition.x < 0
      ? "right"
      : "left"
    : "center";
  const sideSuffix = side === "center" ? "" : `_${side}`;
  const backSideSuffix = side === "center" ? "" : `_${side}`;

  if (/skull|cranial|head|brain/.test(normalizedName)) {
    return regionById(currentView === "front" ? "head_front" : "head_back");
  }
  if (/face|facial|masseter|mandible|maxilla|zygomatic|nasal|orbicularisoris/.test(normalizedName)) {
    return regionById("face");
  }
  if (/neck|cervical|larynx|thyroid|hyoid|sternocleidomastoid/.test(normalizedName)) {
    return regionById(currentView === "front" ? "throat" : "neck_back");
  }
  if (/pectoral|chest|thorax|intercostal/.test(normalizedName)) {
    return regionById(side === "center" ? "upper_back" : `chest${sideSuffix}`);
  }
  if (/rectusabdominis|oblique|transversusabdominis|diaphragm/.test(normalizedName)) {
    return regionById("upper_abdomen");
  }
  if (/inguinal|pelvic|psoas|iliacus|groin/.test(normalizedName)) {
    return regionById("pelvis");
  }
  if (/deltoid|rotatorcuff|supraspinatus|infraspinatus|teresmajor|teresminor|trapezius/.test(normalizedName)) {
    return regionById(currentView === "back" ? `shoulder_back${backSideSuffix}` : `shoulder${sideSuffix}`);
  }
  if (/bicepsbrachii|tricepsbrachii|brachialis|coracobrachialis/.test(normalizedName)) {
    return regionById(currentView === "back" ? `upper_arm_back${backSideSuffix}` : `upper_arm${sideSuffix}`);
  }
  if (/anconeus|olecranon/.test(normalizedName)) {
    return regionById(currentView === "back" ? `elbow_back${backSideSuffix}` : `elbow${sideSuffix}`);
  }
  if (/forearm|brachioradialis|pronator|supinator|flexorcarpi|extensorcarpi/.test(normalizedName)) {
    return regionById(`forearm${sideSuffix}`);
  }
  if (/wrist|carpal/.test(normalizedName)) return regionById(`wrist${sideSuffix}`);
  if (/hand|finger|metacarpal|phalange/.test(normalizedName)) return regionById(`hand${sideSuffix}`);
  if (/glute|tensorfasciaelatae|piriformis/.test(normalizedName)) {
    return regionById(currentView === "back" ? `gluteal${backSideSuffix}` : `hip${sideSuffix}`);
  }
  if (/quadriceps|femoris|adductor|sartorius|thigh|hamstring|bicepsfemoris/.test(normalizedName)) {
    return regionById(currentView === "back" && isBackStructure ? `thigh_back${backSideSuffix}` : `thigh${sideSuffix}`);
  }
  if (/patella|knee|popliteal/.test(normalizedName)) {
    return regionById(currentView === "back" ? `knee_back${backSideSuffix}` : `knee${sideSuffix}`);
  }
  if (/gastrocnemius|soleus|tibialis|fibularis|peroneus|calf|shin|lowerleg/.test(normalizedName)) {
    return regionById(currentView === "back" ? `calf${backSideSuffix}` : `lower_leg${sideSuffix}`);
  }
  if (/ankle|malleolus/.test(normalizedName)) {
    return regionById(currentView === "back" ? `heel${backSideSuffix}` : `ankle${sideSuffix}`);
  }
  if (/foot|toe|phalanx/.test(normalizedName)) {
    return regionById(currentView === "back" ? `heel${backSideSuffix}` : `foot${sideSuffix}`);
  }

  return null;
};

interface BodyModelSceneProps {
  currentView: "front" | "back";
  zoomScale: number;
  resetToken: number;
  confirmedLocations: PainLocationItem[];
  pendingSelection: PainLocationItem | null;
  onRegionClick: (region: BodyRegionDef) => void;
}

const BodyModelScene: React.FC<BodyModelSceneProps> = ({
  currentView,
  zoomScale,
  resetToken,
  confirmedLocations,
  pendingSelection,
  onRegionClick,
}) => {
  const { camera } = useThree();
  const { scene } = useGLTF(HUMAN_BODY_MODEL_PATH, "/draco/");
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (Array.isArray(object.material)) {
        object.material = object.material.map((material) => material.clone());
      } else {
        object.material = object.material.clone();
      }
    });

    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  useEffect(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const distance = Math.max(maxDimension * 1.35, 2.5);

    camera.position.set(0, center.y, currentView === "front" ? distance : -distance);
    camera.lookAt(center);
    camera.zoom = zoomScale;
    camera.updateProjectionMatrix();
  }, [camera, currentView, model, resetToken, zoomScale]);

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const metadata = object.userData as { type?: string };
      object.visible = !metadata.type || metadata.type === "muscle";
      const region = resolveMeshRegion(object, currentView);
      if (!region) return;

      const isPending = pendingSelection?.region === region.id && pendingSelection.bodyView === region.view;
      const isConfirmed = confirmedLocations.some(
        (location) => location.region === region.id && location.bodyView === region.view
      );
      const materials = Array.isArray(object.material) ? object.material : [object.material];

      materials.forEach((material) => {
        const standardMaterial = material as THREE.MeshStandardMaterial;
        standardMaterial.emissive = new THREE.Color(
          isPending ? "#f59e0b" : isConfirmed ? "#e11d48" : "#000000"
        );
        standardMaterial.emissiveIntensity = isPending || isConfirmed ? 0.65 : 0;
      });
    });
  }, [confirmedLocations, currentView, model, pendingSelection]);

  return (
    <>
      {React.createElement("ambientLight", { intensity: 1.6 })}
      {React.createElement("directionalLight", { position: [3, 5, 4], intensity: 2.2, castShadow: true })}
      {React.createElement("directionalLight", { position: [-3, 2, -3], intensity: 0.8 })}
      {React.createElement("primitive", {
        object: model,
        scale: 1.8,
        onPointerDown: (event: { stopPropagation: () => void; object: THREE.Object3D }) => {
          event.stopPropagation();
          const region = resolveMeshRegion(event.object, currentView);
          if (region) onRegionClick(region);
        },
      })}
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={7} enableDamping />
    </>
  );
};

class BodyModelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="z-10 max-w-sm rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center text-sm text-amber-950 shadow-sm">
          <p className="font-black">3D human model asset required</p>
          <p className="mt-2 text-xs leading-relaxed">
            Add a named-mesh human model at <code className="font-bold">public{HUMAN_BODY_MODEL_PATH}</code> to enable the interactive body.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface BodyPainLocationSelectorProps {
  selectedLanguage: LanguageOption;
  initialLocations?: PainLocationItem[];
  suggestedComplaint?: string;
  onConfirmLocations: (locations: PainLocationItem[]) => void;
  onClose?: () => void;
  isInlineInInterview?: boolean;
  character?: "female" | "male";
}

export const BodyPainLocationSelector: React.FC<BodyPainLocationSelectorProps> = ({
  selectedLanguage,
  initialLocations = [],
  suggestedComplaint = "",
  onConfirmLocations,
  onClose,
  isInlineInInterview = false,
  character = "female",
}) => {
  const [currentView, setCurrentView] = useState<"front" | "back">("front");
  const [confirmedLocations, setConfirmedLocations] = useState<PainLocationItem[]>(initialLocations);
  const [pendingSelection, setPendingSelection] = useState<PainLocationItem | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<number>(6);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [resetToken, setResetToken] = useState<number>(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const { t: translate } = useLanguage();

  const loc = useMemo(() => {
    const fallback = BODY_MAP_LOCALES[selectedLanguage.name] || BODY_MAP_LOCALES["English"];
    return {
      title: translate("bodyMap.title", fallback.title),
      subtitle: translate("bodyMap.subtitle", fallback.subtitle),
      frontView: translate("bodyMap.frontView", fallback.frontView),
      backView: translate("bodyMap.backView", fallback.backView),
      patientsRight: translate("bodyMap.patientsRight", fallback.patientsRight),
      patientsLeft: translate("bodyMap.patientsLeft", fallback.patientsLeft),
      tapPrompt: translate("bodyMap.tapPrompt", fallback.tapPrompt),
      confirmationPrompt: translate("bodyMap.confirmationPrompt", fallback.confirmationPrompt),
      yesConfirm: translate("bodyMap.yesConfirm", fallback.yesConfirm),
      changeArea: translate("bodyMap.changeArea", fallback.changeArea),
      clearSelection: translate("bodyMap.clearSelection", fallback.clearSelection),
      addAnotherArea: translate("bodyMap.addAnotherArea", fallback.addAnotherArea),
      doneContinuing: translate("bodyMap.doneContinuing", fallback.doneContinuing),
      confirmedAreas: translate("bodyMap.confirmedAreas", fallback.confirmedAreas),
      severityLabel: translate("bodyMap.severityLabel", fallback.severityLabel),
      zoomIn: translate("bodyMap.zoomIn", fallback.zoomIn),
      zoomOut: translate("bodyMap.zoomOut", fallback.zoomOut),
      resetView: translate("bodyMap.resetView", fallback.resetView),
      quickSelector: translate("bodyMap.quickSelector", fallback.quickSelector),
    };
  }, [selectedLanguage, translate]);


  // Voice announcement helper
  const speakGuidance = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage.ttsLang || "en-IN";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Initial welcome voice prompt on mount
  useEffect(() => {
    // If patient already mentioned a symptom like "stomach" or "chest", auto-suggest
    if (suggestedComplaint) {
      const lower = suggestedComplaint.toLowerCase();
      const allRegs = [...FRONT_REGIONS, ...BACK_REGIONS];
      const match = allRegs.find((r) =>
        r.altKeywords?.some((k) => lower.includes(k)) || lower.includes(r.name.toLowerCase())
      );
      if (match) {
        if (match.view !== currentView) {
          setCurrentView(match.view);
        }
        setPendingSelection({
          bodyView: match.view,
          region: match.id,
          side: match.side,
          displayName: match.name,
          confirmedByPatient: false,
          coordinates: { x: match.labelX, y: match.labelY },
          intensity: 6,
        });
      }
    }

    // Gentle spoken guidance
    const timer = setTimeout(() => {
      speakGuidance(loc.tapPrompt);
    }, 400);

    return () => {
      clearTimeout(timer);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentRegions = useMemo(() => {
    const list = currentView === "front" ? FRONT_REGIONS : BACK_REGIONS;
    if (activeCategoryFilter === "all") return list;
    return list.filter((r) => r.category === activeCategoryFilter);
  }, [currentView, activeCategoryFilter]);

  // Handle region tap
  const handleRegionClick = (region: BodyRegionDef) => {
    const newPending: PainLocationItem = {
      bodyView: region.view,
      region: region.id,
      side: region.side,
      displayName: region.name,
      coordinates: { x: region.labelX, y: region.labelY },
      confirmedByPatient: false,
      intensity: selectedIntensity,
    };
    setPendingSelection(newPending);

    // Prompt voice confirmation in selected language:
    // e.g. "Right Knee. Is this where you feel the pain?"
    const spokenConfirm = `${region.name}. ${loc.confirmationPrompt}`;
    speakGuidance(spokenConfirm);
  };

  // Confirm pending location
  const handleConfirmPending = () => {
    if (!pendingSelection) return;
    const confirmed: PainLocationItem = {
      ...pendingSelection,
      intensity: selectedIntensity,
      confirmedByPatient: true,
    };

    // Avoid duplicate additions
    setConfirmedLocations((prev) => {
      const filtered = prev.filter(
        (p) => !(p.region === confirmed.region && p.bodyView === confirmed.bodyView)
      );
      return [...filtered, confirmed];
    });

    setPendingSelection(null);

    // Spoken confirmation
    const ack =
      selectedLanguage.name === "Hindi"
        ? "स्थान दर्ज कर लिया गया है।"
        : selectedLanguage.name === "Tamil"
        ? "இடம் உறுதிசெய்யப்பட்டது."
        : "Location confirmed.";
    speakGuidance(ack);
  };

  // Remove a confirmed location
  const handleRemoveLocation = (index: number) => {
    setConfirmedLocations((prev) => prev.filter((_, i) => i !== index));
  };

  // Final submit back to interview
  const handleFinish = () => {
    let finalLocations = [...confirmedLocations];
    if (pendingSelection && !confirmedLocations.some((c) => c.region === pendingSelection.region)) {
      finalLocations.push({ ...pendingSelection, confirmedByPatient: true });
    }
    if (finalLocations.length === 0 && pendingSelection) {
      finalLocations = [{ ...pendingSelection, confirmedByPatient: true }];
    }
    onConfirmLocations(finalLocations);
  };

  return (
    <div
      id="body-pain-location-selector"
      className="bg-white rounded-3xl border-2 border-sky-300 shadow-xl overflow-hidden flex flex-col max-w-4xl mx-auto w-full transition-all animate-in fade-in duration-300"
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
            <Activity className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-none">
                {loc.title}
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Interactive Body Map
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-1 font-medium leading-tight line-clamp-1 sm:line-clamp-none">
              {loc.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => speakGuidance(loc.tapPrompt)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Listen to instructions"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-amber-300 animate-pulse" : ""}`} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Body Map"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left / Body Canvas View (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center">
          {/* Front / Back View Switcher Tabs */}
          <div className="w-full flex items-center justify-between gap-2 mb-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                id="body-view-front-btn"
                onClick={() => {
                  setCurrentView("front");
                  speakGuidance(loc.frontView);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === "front"
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{loc.frontView}</span>
              </button>

              <button
                type="button"
                id="body-view-back-btn"
                onClick={() => {
                  setCurrentView("back");
                  speakGuidance(loc.backView);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === "back"
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{loc.backView}</span>
              </button>
            </div>

            {/* Zoom / Reset Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(z + 0.2, 1.8))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title={loc.zoomIn}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(z - 0.2, 0.8))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title={loc.zoomOut}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setResetToken((token) => token + 1);
                }}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title={loc.resetView}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Orientation Badges */}
          <div className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 mb-1">
            <span className="flex items-center gap-1 text-sky-700">
              ← {currentView === "front" ? loc.patientsRight : loc.patientsLeft}
            </span>
            <span className="text-slate-400">
              {currentView === "front" ? "Facing Patient" : "Posterior / Back"}
            </span>
            <span className="flex items-center gap-1 text-sky-700">
              {currentView === "front" ? loc.patientsLeft : loc.patientsRight} →
            </span>
          </div>

          {/* Interactive Human Body 3D Canvas */}
          <div
            className="w-full bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-3xl border-2 border-slate-200 p-3 sm:p-4 flex items-center justify-center relative overflow-hidden shadow-inner min-h-[460px]"
          >
            {/* Ambient grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            <BodyModelErrorBoundary>
              <Canvas
                camera={{ position: [0, 0.2, 4.8], fov: 35 }}
                dpr={[1, 2]}
                className="h-[440px] w-full touch-none"
                onCreated={({ gl }) => {
                  gl.setClearColor("#f8fafc", 0);
                }}
              >
                <BodyModelScene
                  currentView={currentView}
                  zoomScale={zoomScale}
                  resetToken={resetToken}
                  confirmedLocations={confirmedLocations}
                  pendingSelection={pendingSelection}
                  onRegionClick={handleRegionClick}
                />
              </Canvas>
            </BodyModelErrorBoundary>

            {/* Quick Helper Floating Tooltip */}
            <div className="absolute bottom-2 left-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{loc.tapPrompt}</span>
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400">
                {currentRegions.length} Active Regions
              </span>
            </div>
          </div>
        </div>

        {/* Right / Confirmation & Locations Panel (5 cols) */}
        <div className="md:col-span-5 space-y-4 flex flex-col justify-between h-full">
          {/* CASE LINE AI Avatar Guidance Card */}
          <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50/70 rounded-3xl p-4 border-2 border-sky-200/90 shadow-xs relative overflow-hidden flex flex-col items-center">
            {/* Ambient gentle background */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 w-full">
              {/* Avatar with eye contact, interview pose, synchronized speech mood */}
              <div className="shrink-0 relative">
                <CaseLineAvatar
                  size="md"
                  character={character}
                  mood={isSpeaking ? "SPEAKING" : "IDLE"}
                  pose="interview"
                  interviewState={isSpeaking ? "SPEAKING" : "READY"}
                  showStatusBadge={true}
                  showWaveformBars={false}
                />
              </div>

              {/* Speech bubble / guidance */}
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                    CASE LINE Voice Assistant
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-teal-700 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      <span>Speaking</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                  {pendingSelection
                    ? `"${pendingSelection.displayName}. ${loc.confirmationPrompt}"`
                    : confirmedLocations.length > 0
                    ? `✓ ${confirmedLocations.length} area(s) recorded. Tap another area or finish below.`
                    : `"${loc.tapPrompt}"`}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-sky-700 font-bold mt-1">
                  <span className="animate-pulse">👉</span>
                  <span>
                    {pendingSelection
                      ? "Confirm below or tap another area on the body"
                      : "Tap on the body illustration to show exact pain site"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Selection Dialog */}
          {pendingSelection ? (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    Selected Location
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {pendingSelection.displayName}
                  </h3>
                  <p className="text-xs text-amber-900 font-semibold mt-0.5">
                    {pendingSelection.side.toUpperCase()} • {pendingSelection.bodyView === "front" ? loc.frontView : loc.backView}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
              </div>

              {/* Confirmation Question */}
              <div className="bg-white p-3.5 rounded-2xl border border-amber-300/80 shadow-2xs space-y-1">
                <p className="text-sm font-black text-slate-900">
                  "{loc.confirmationPrompt}"
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {pendingSelection.displayName} ({pendingSelection.side === "right" ? "Patient's Right" : pendingSelection.side === "left" ? "Patient's Left" : "Center"})
                </p>
              </div>

              {/* Pain Severity Rating Slider (Optional Clinical Enrichment) */}
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{loc.severityLabel}</span>
                  <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {selectedIntensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedIntensity}
                  onChange={(e) => setSelectedIntensity(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Mild (1-3)</span>
                  <span>Moderate (4-6)</span>
                  <span>Severe (7-10)</span>
                </div>
              </div>

              {/* YES / CHANGE Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  id="confirm-pain-location-btn"
                  onClick={handleConfirmPending}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{loc.yesConfirm}</span>
                </button>

                <button
                  type="button"
                  id="change-pain-location-btn"
                  onClick={() => setPendingSelection(null)}
                  className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{loc.changeArea}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-4 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-sky-950">
                Tap anywhere on the body illustration
              </h4>
              <p className="text-xs text-sky-800 leading-relaxed max-w-xs mx-auto">
                Select head, chest, stomach, knee, shoulders, or any other area. You can switch between Front and Back views.
              </p>
            </div>
          )}

          {/* Quick Body Zone Chips for Elderly & Accessibility */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {loc.quickSelector}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {[
                { label: "Head", id: "head_front", view: "front" },
                { label: "Throat / Neck", id: "throat", view: "front" },
                { label: "Chest (Center)", id: "chest_right", view: "front" },
                { label: "Upper Stomach (Stomach)", id: "upper_abdomen", view: "front" },
                { label: "Lower Abdomen", id: "lower_abdomen", view: "front" },
                { label: "Upper Back", id: "upper_back", view: "back" },
                { label: "Lower Back", id: "lower_back", view: "back" },
                { label: "Right Shoulder", id: "shoulder_right", view: "front" },
                { label: "Left Shoulder", id: "shoulder_left", view: "front" },
                { label: "Right Knee", id: "knee_right", view: "front" },
                { label: "Left Knee", id: "knee_left", view: "front" },
                { label: "Right Ankle / Foot", id: "foot_right", view: "front" },
                { label: "Left Ankle / Foot", id: "foot_left", view: "front" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.view !== currentView) setCurrentView(item.view as any);
                    const list = item.view === "front" ? FRONT_REGIONS : BACK_REGIONS;
                    const r = list.find((x) => x.id === item.id);
                    if (r) handleRegionClick(r);
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confirmed Locations List */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {loc.confirmedAreas} ({confirmedLocations.length})
                </span>
              </div>
              {confirmedLocations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmedLocations([])}
                  className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{loc.clearSelection}</span>
                </button>
              )}
            </div>

            {confirmedLocations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No pain locations confirmed yet. Tap the body to add.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {confirmedLocations.map((locItem, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                      <div>
                        <span className="font-black text-rose-950 block leading-tight">
                          {locItem.displayName}
                        </span>
                        <span className="text-[10px] text-rose-700 font-semibold">
                          {locItem.bodyView.toUpperCase()} • Severity: {locItem.intensity || 6}/10
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Submission Bar */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              id="body-map-submit-btn"
              onClick={handleFinish}
              disabled={confirmedLocations.length === 0 && !pendingSelection}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <span>{loc.doneContinuing}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
