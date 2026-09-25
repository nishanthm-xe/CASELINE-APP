import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  SkipForward,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  Volume2,
  ShieldCheck,
  Crop,
  X,
} from "lucide-react";
import {
  MedicalDocument,
  LanguageOption,
  DemographicData,
} from "../types";
import { CaseLineAvatar } from "./CaseLineAvatar";
import { processDocumentOcr } from "../services/apiService";
import { evaluateInvestigationStatus } from "../utils/investigationUtils";
import { useLanguage } from "../context/LanguageContext";


interface DocumentScanScreenProps {
  patient: DemographicData;
  selectedLanguage: LanguageOption;
  existingDocuments: MedicalDocument[];
  onDocumentProcessed: (doc: MedicalDocument) => void;
  onSkipToFinalReview: () => void;
  onBackToSummary: () => void;
  onRemoveDocument?: (docId: string) => void;
  onViewDocumentReview?: (doc: MedicalDocument) => void;
}

export type DocumentTypeOption =
  | "Prescription"
  | "Laboratory report"
  | "Discharge summary"
  | "Scan / investigation report"
  | "Other Medical Record";

export const DocumentScanScreen: React.FC<DocumentScanScreenProps> = ({
  patient,
  selectedLanguage,
  existingDocuments,
  onDocumentProcessed,
  onSkipToFinalReview,
  onBackToSummary,
  onRemoveDocument,
  onViewDocumentReview,
}) => {
  // Document category state
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentTypeOption>("Prescription");
  const [institutionName, setInstitutionName] = useState("");

  // Scan & Upload state
  const [mode, setMode] = useState<"SELECT" | "CAMERA" | "PREVIEW" | "OCR_PROCESSING">("SELECT");
  const [selectedFile, setSelectedFile] = useState<{
    base64: string;
    mimeType: string;
    name: string;
    size: number;
    rotation: number;
  } | null>(null);

  // Camera stream state
  const { t } = useLanguage();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fallbackCameraInputRef = useRef<HTMLInputElement | null>(null);

  // OCR processing state & error
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [avatarMood, setAvatarMood] = useState<"SPEAKING" | "IDLE" | "PROCESSING" | "ERROR">("SPEAKING");

  // Localized spoken guidance
  const guidanceMessages: Record<string, { welcome: string; reading: string }> = {
    English: {
      welcome: "You can scan your previous medical records here. I will help organize them for your doctor.",
      reading: "I'm reading the document.",
    },
    Hindi: {
      welcome: "आप यहाँ अपने पिछले मेडिकल रिकॉर्ड स्कैन कर सकते हैं। मैं उन्हें आपके डॉक्टर के लिए व्यवस्थित करने में मदद करूँगी।",
      reading: "मैं दस्तावेज़ पढ़ रही हूँ।",
    },
    Tamil: {
      welcome: "உங்கள் முந்தைய மருத்துவ ஆவணங்களை இங்கே ஸ்கேன் செய்யலாம். உங்கள் மருத்துவருக்கு அவற்றை ஒழுங்கமைக்க நான் உதவுவேன்.",
      reading: "நான் ஆவணத்தைப் படிக்கிறேன்.",
    },
    Telugu: {
      welcome: "మీరు మీ మునుపటి వైద్య రికార్డులను ఇక్కడ స్కాన్ చేయవచ్చు. మీ డాక్టర్ కోసం వాటిని నిర్వహించడానికి నేను సహాయం చేస్తాను.",
      reading: "నేను పత్రాన్ని చదువుతున్నాను.",
    },
    Kannada: {
      welcome: "ನಿಮ್ಮ ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ನೀವು ಇಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು. ನಿಮ್ಮ ವೈದ್ಯರಿಗಾಗಿ ಅವುಗಳನ್ನು ಸಂಘಟಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
      reading: "ನಾನು ದಾಖಲೆಯನ್ನು ಓದುತ್ತಿದ್ದೇನೆ.",
    },
    Malayalam: {
      welcome: "നിങ്ങൾക്ക് മുൻപുള്ള മെഡിക്കൽ രേഖകൾ ഇവിടെ സ്കാൻ ചെയ്യാം. നിങ്ങളുടെ ഡോക്ടർക്കായി അവ ക്രമീകരിക്കാൻ ഞാൻ സഹായിക്കാം.",
      reading: "ഞാൻ രേഖ വായിക്കുന്നു.",
    },
    Bengali: {
      welcome: "আপনি এখানে আপনার পূর্ববর্তী মেডিকেল রেকর্ড স্ক্যান করতে পারেন। ডাক্তারের জন্য সেগুলো গুছিয়ে দিতে আমি সাহায্য করব।",
      reading: "আমি নথিটি পড়ছি।",
    },
    Marathi: {
      welcome: "तुम्ही तुमचे मागील वैद्यकीय रेकॉर्ड येथे स्कॅन करू शकता. मी तुमच्या डॉक्टरांसाठी ते व्यवस्थित करण्यास मदत करेन.",
      reading: "मी दस्तऐवज वाचत आहे.",
    },
    Gujarati: {
      welcome: "તમે તમારા અગાઉના મેડિકલ રેકોર્ડ્સ અહીં સ્કેન કરી શકો છો. હું તમારા ડૉક્ટર માટે તેને વ્યવસ્થિત કરવામાં મદદ કરીશ.",
      reading: "હું દસ્તાવેજ વાંચી રહી છું.",
    },
    Punjabi: {
      welcome: "ਤੁਸੀਂ ਆਪਣੇ ਪਿਛਲੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਇੱਥੇ ਸਕੈਨ ਕਰ ਸਕਦੇ ਹੋ। ਮੈਂ ਤੁਹਾਡੇ ਡਾਕਟਰ ਲਈ ਉਹਨਾਂ ਨੂੰ ਸੰਗਠਿਤ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗੀ।",
      reading: "ਮੈਂ ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹ ਰਹੀ ਹਾਂ।",
    },
    Odia: {
      welcome: "ଆପଣ ଏଠାରେ ଆପଣଙ୍କ ପୂର୍ବ ମେଡିକାଲ୍ ରେକର୍ଡ ସ୍କାନ୍ କରିପାରିବେ। ଡାକ୍ତରଙ୍କ ପାଇଁ ଏହାକୁ ସଜାଡ଼ିବାରେ ମୁଁ ସାହାଯ୍ୟ କରିବି।",
      reading: "ମୁଁ ଦସ୍ତାବିଜ ପଢୁଛି।",
    },
    Assamese: {
      welcome: "আপুনি ইয়াত আপোনাৰ পূৰ্বৰ চিকিৎসা নথিপত্ৰ স্কেন কৰিব পাৰে। মই আপোনাৰ চিকিৎসকৰ বাবে এইবোৰ সজাই দিয়াত সহায় কৰিম।",
      reading: "মই নথিপত্ৰ পঢ়ি আছো।",
    },
    Urdu: {
      welcome: "آپ یہاں اپنے پچھلے طبی ریکارڈ اسکین کر سکتے ہیں۔ میں آپ کے ڈاکٹر کے لیے انہیں منظم کرنے میں مدد کروں گی۔",
      reading: "میں دستاویز پڑھ رہی ہوں۔",
    },
  };

  const fallbackGuidance =
    guidanceMessages[selectedLanguage.name] || guidanceMessages.English;
  const currentGuidance = {
    welcome: t("documents.welcomeGuidance", fallbackGuidance.welcome),
    reading: t("documents.readingGuidance", fallbackGuidance.reading),
  };


  // Speak guidance on mount
  useEffect(() => {
    speakText(currentGuidance.welcome);
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.ttsLang || "en-IN";
      utterance.rate = 0.95;
      utterance.onstart = () => setAvatarMood("SPEAKING");
      utterance.onend = () => setAvatarMood("IDLE");
      utterance.onerror = () => setAvatarMood("IDLE");
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    const requestId = ++cameraRequestRef.current;
    console.log("CAMERA: starting", { requestId });
    setCameraError(null);
    setOcrError(null);
    const video = videoRef.current;
    console.log("CAMERA: video element found", Boolean(video));
    if (!video) {
      setCameraError("Camera preview is still loading. Please try again.");
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      console.log("CAMERA: stream obtained", {
        active: stream.active,
        tracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          readyState: track.readyState,
          enabled: track.enabled,
        })),
      });

      if (requestId !== cameraRequestRef.current || mode !== "CAMERA") {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      console.log("CAMERA: srcObject assigned", {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      await video.play();
      console.log("CAMERA: video playing", {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        paused: video.paused,
      });
      if (requestId === cameraRequestRef.current && mode === "CAMERA") {
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? t("documents.cameraDenied", "Camera permission was denied. You can still upload a document or use the device photo capture below.")
          : t("documents.cameraError", "Unable to access device camera. Please use the upload option or capture below.")
      );
      setCameraActive(false);
    }

  };

  const stopCamera = () => {
    cameraRequestRef.current += 1;
    if (streamRef.current) {
      console.log("CAMERA: stopping stream", streamRef.current.getTracks().map((track) => ({
        kind: track.kind,
        readyState: track.readyState,
        enabled: track.enabled,
      })));
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode !== "CAMERA") {
      stopCamera();
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      void startCamera();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      stopCamera();
    };
  }, [mode]);

  // Capture frame from active camera stream
  const captureDocumentFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.92);

    setSelectedFile({
      base64,
      mimeType: "image/jpeg",
      name: `Scan_${selectedDocType.replace(/\s+/g, "_")}_${new Date().toISOString().substring(0, 10)}.jpg`,
      size: Math.round(base64.length * 0.75),
      rotation: 0,
    });
    setMode("PREVIEW");
  };

  // Handle file selection from file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: PDF, JPG, JPEG, PNG
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validMimes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setOcrError(t("documents.unsupportedType", "Unsupported file type. Please upload a PDF, JPG, or PNG document."));
      return;
    }

    // Validate size (< 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setOcrError(t("documents.fileTooLarge", "File too large. Please select a document under 25MB."));
      return;
    }

    setOcrError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedFile({
        base64,
        mimeType: file.type || "image/jpeg",
        name: file.name,
        size: file.size,
        rotation: 0,
      });
      setMode("PREVIEW");
    };
    reader.onerror = () => {
      setOcrError(t("documents.fileReadFailed", "Failed to read the selected file. Please try another file."));
    };

    reader.readAsDataURL(file);
  };

  // Rotate preview image 90 degrees
  const handleRotate = () => {
    if (!selectedFile) return;
    if (selectedFile.mimeType === "application/pdf") {
      // PDF rotation not applicable on canvas easily
      return;
    }
    const newRotation = (selectedFile.rotation + 90) % 360;

    // Apply rotation on canvas
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (newRotation % 180 !== 0) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((newRotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedBase64 = canvas.toDataURL(selectedFile.mimeType, 0.92);
      setSelectedFile({
        ...selectedFile,
        base64: rotatedBase64,
        rotation: 0, // Reset to zero since pixels are transformed
      });
    };
    img.src = selectedFile.base64;
  };

  // Real OCR Processing trigger
  const handleProcessDocument = async () => {
    if (!selectedFile) return;
    setOcrError(null);
    setMode("OCR_PROCESSING");
    setAvatarMood("PROCESSING");
    speakText(currentGuidance.reading);

    try {
      const ocrResult = await processDocumentOcr(
        selectedFile.base64,
        selectedFile.mimeType,
        selectedDocType,
        selectedFile.name
      );

      if (!ocrResult) {
        throw new Error("Unable to extract information from this document.");
      }

      // Map investigation status against adult reference ranges
      const mappedInvs = (ocrResult.investigations || []).map((inv: any, i: number) => {
        const evalResult = evaluateInvestigationStatus(inv.value, inv.referenceRange);
        return {
          id: `inv-${Date.now()}-${i}`,
          testName: inv.testName || "Laboratory Test",
          value: inv.value || "",
          unit: inv.unit || "",
          referenceRange: inv.referenceRange || "Standard",
          status: inv.status || evalResult.status,
          interpretation: inv.interpretation || evalResult.interpretation,
          date: inv.date || ocrResult.documentDate || "Date not available",
          needsReview: inv.needsReview || evalResult.status === "undetermined",
        };
      });

      // Map medicines
      const mappedMeds = (ocrResult.medicines || []).map((m: any, i: number) => ({
        id: `med-${Date.now()}-${i}`,
        name: m.name || "Medication",
        dose: m.dosage || m.dose || "As directed",
        frequency: m.frequency || "Daily",
        duration: m.duration || "Ongoing",
        instructions: m.instructions || "",
        source: "extracted-from-document" as const,
        needsReview: m.needsReview || false,
      }));

      const newDoc: MedicalDocument = {
        id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patientId: patient.patientId,
        title: `${ocrResult.documentType || selectedDocType} - ${ocrResult.institutionOrDoctor || institutionName || "Medical Record"}`,
        documentType: (ocrResult.documentType as any) || selectedDocType,
        date: ocrResult.documentDate || "Date not available",
        institutionOrDoctor: ocrResult.institutionOrDoctor || institutionName || "Medical Centre",
        filePreview: selectedFile.base64,
        fileName: selectedFile.name,
        fileType: selectedFile.mimeType,
        fileSize: selectedFile.size,
        rawText: ocrResult.rawExtractedText || "",
        extractedDiagnoses: ocrResult.diagnoses || [],
        extractedMedicines: mappedMeds,
        extractedInvestigations: mappedInvs,
        proceduresMentioned: ocrResult.procedures || [],
        allergiesMentioned: ocrResult.allergiesMentioned || [],
        treatmentInformation: ocrResult.treatmentInformation || "",
        relevantClinicalNotes: ocrResult.relevantClinicalNotes || "",
        status: ocrResult.needsVerification ? "needs_review" : "processed",
        confidenceScore: ocrResult.confidenceScore ?? 0.88,
        isHandwritten: ocrResult.isHandwritten ?? false,
        handwritingReadability: ocrResult.handwritingReadability ?? "clear",
        unreadableSections: ocrResult.unreadableSections || [],
        uncertainFields: ocrResult.uncertainFields || (ocrResult.needsVerification ? ["Please verify all values"] : []),
        needsVerification: ocrResult.needsVerification || (ocrResult.confidenceScore && ocrResult.confidenceScore < 0.85),
      };

      setAvatarMood("IDLE");
      onDocumentProcessed(newDoc);
    } catch (err: any) {
      console.warn("OCR failure:", err);
      setAvatarMood("ERROR");
      setMode("PREVIEW");
      setOcrError(
        t(
          "documents.ocrError",
          "Unable to extract information from this document. You can retry, select another document, or continue without this document."
        )
      );

    }
  };

  const handleRetake = () => {
    setSelectedFile(null);
    setOcrError(null);
    setMode("CAMERA");
  };

  const handleRemoveSelected = () => {
    setSelectedFile(null);
    setOcrError(null);
    setMode("SELECT");
  };

  const docTypesList: Array<{ type: DocumentTypeOption; label: string; icon: string }> = [
    { type: "Prescription", label: "Prescription", icon: "💊" },
    { type: "Laboratory report", label: "Laboratory Report", icon: "🧪" },
    { type: "Discharge summary", label: "Discharge Summary", icon: "🏥" },
    { type: "Scan / investigation report", label: "Scan / Imaging Report", icon: "🩻" },
    { type: "Other Medical Record", label: "Other Medical Record", icon: "📋" },
  ];

  return (
    <div
      id="document-scan-screen"
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-28"
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
      />
      <input
        type="file"
        ref={fallbackCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Top Header Navigation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSummary}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Summary</span>
          </button>
          <span className="text-slate-300">•</span>
          <div className="text-xs font-bold text-slate-400">
            Step 4 of 6: <span className="text-sky-700 font-black">Add Medical Records</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSkipToFinalReview}
          className="px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Skip for Now</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-Column Responsive Layout: MAIN WORKFLOW (8 Cols) | AVATAR (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN SCAN & UPLOAD AREA (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card: Title & Subtitle */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold tracking-wide uppercase">
                  Case Line Intake Flow
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ABDM Compliant OCR
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Add Medical Records
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Do you have previous medical documents to add?
              </p>
            </div>

            {/* Document Type Selector Tabs */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                Select Document Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {docTypesList.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedDocType(type)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedDocType === type
                        ? "border-sky-600 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Institution or Clinic Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-1.5">
                Hospital / Clinic / Provider Name (Optional)
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g., Apollo Specialty Hospital, City Clinic, Max Health"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* CAMERA MODE */}
            {mode === "CAMERA" && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-sky-500 shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />

                  {/* Optical Document Framing Overlay */}
                  <div className="absolute inset-6 border-2 border-dashed border-white/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[11px] font-bold text-white bg-black/50 px-2 py-1 rounded w-fit">
                      <span>Position document within frame</span>
                    </div>
                    <div className="text-center text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-1 rounded self-center">
                      Hold steady for clear OCR reading
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setMode("SELECT");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel Camera
                  </button>

                  <button
                    type="button"
                    id="capture-document-btn"
                    onClick={captureDocumentFromVideo}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Document</span>
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW OF CAPTURED / UPLOADED DOCUMENT */}
            {mode === "PREVIEW" && selectedFile && (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">
                          {selectedFile.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {selectedDocType} • {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedFile.mimeType !== "application/pdf" && (
                        <button
                          type="button"
                          onClick={handleRotate}
                          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Rotate</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveSelected}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Document preview viewport */}
                  <div className="rounded-xl overflow-hidden bg-slate-900/5 max-h-96 flex items-center justify-center p-2 border border-slate-200">
                    {selectedFile.mimeType === "application/pdf" ? (
                      <div className="p-8 text-center space-y-2">
                        <FileSpreadsheet className="w-12 h-12 text-sky-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          PDF Document Ready for OCR
                        </p>
                        <p className="text-[11px] text-slate-500">
                          CaseLine OCR will extract diagnoses, medications, and laboratory values.
                        </p>
                      </div>
                    ) : (
                      <img
                        src={selectedFile.base64}
                        alt="Scanned Document Preview"
                        className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>

                {/* Error Banner if OCR or capture encountered issue */}
                {ocrError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{ocrError}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleProcessDocument}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
                      >
                        Retry OCR
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-bold text-[11px] hover:bg-rose-50 cursor-pointer"
                      >
                        Upload Another Document
                      </button>
                      <button
                        type="button"
                        onClick={onSkipToFinalReview}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] hover:bg-slate-200 cursor-pointer"
                      >
                        Continue Without This Document
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change File</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    id="process-document-btn"
                    onClick={handleProcessDocument}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Use This Document & Process OCR →</span>
                  </button>
                </div>
              </div>
            )}

            {/* OCR PROCESSING STATE */}
            {mode === "OCR_PROCESSING" && (
              <div className="p-8 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center animate-spin">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-sky-950">
                    Extracting Medical Data with Clinical OCR...
                  </h3>
                  <p className="text-xs text-sky-700 mt-1 max-w-md mx-auto">
                    CaseLine is reading doctor handwriting, medication doses, and laboratory ranges from your {selectedDocType}.
                  </p>
                </div>
              </div>
            )}

            {/* SELECT MODE: BIG CARDS (Scan Document, Upload Document, Skip) */}
            {mode === "SELECT" && (
              <div className="space-y-4">
                {/* Camera error notification if denied */}
                {cameraError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-semibold">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => fallbackCameraInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 cursor-pointer"
                      >
                        Use Device Camera Directly
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Big Card 1: 📷 Scan Document */}
                  <button
                    type="button"
                    id="scan-document-option-btn"
                    onClick={() => setMode("CAMERA")}
                    className="p-6 rounded-3xl border-2 border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/40 text-left transition-all group shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-44"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-slate-900 group-hover:text-sky-900 flex items-center gap-1.5">
                        <span>📷 Scan Document</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Use device camera to photograph prescription or paper report
                      </p>
                    </div>
                  </button>

                  {/* Big Card 2: 📁 Upload Document */}
                  <button
                    type="button"
                    id="upload-document-option-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-3xl border-2 border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/40 text-left transition-all group shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-44"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-slate-900 group-hover:text-indigo-900 flex items-center gap-1.5">
                        <span>📁 Upload Document</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Select PDF, JPG, JPEG, or PNG files from your phone or computer
                      </p>
                    </div>
                  </button>
                </div>

                {/* Big Option 3: ⏭ Skip for Now */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    id="skip-document-scan-btn"
                    onClick={onSkipToFinalReview}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>⏭ Skip for Now (Continue to Final Summary)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: MULTIPLE DOCUMENTS MANAGEMENT */}
          {existingDocuments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>Attached Medical Records ({existingDocuments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Original documents and confirmed OCR extracts connected to your record
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {existingDocuments.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-black flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {doc.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmed ✓
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {doc.documentType} • {doc.date} • {doc.institutionOrDoctor}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onViewDocumentReview && (
                        <button
                          type="button"
                          onClick={() => onViewDocumentReview(doc)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      )}
                      {onRemoveDocument && (
                        <button
                          type="button"
                          onClick={() => onRemoveDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT AREA: Video AI Avatar guiding patient in selected language (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center sticky top-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md w-full flex flex-col items-center text-center">
            <div className="mb-2">
              <CaseLineAvatar
                size="hero"
                character="female"
                mood={avatarMood}
                pose="document"
                showStatusBadge={true}
              />
            </div>

            {/* Avatar Speech Bubble in selected language */}
            <div className="mt-4 relative bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center w-full">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-sky-50 border-t border-l border-sky-200 rotate-45" />
              <p className="relative z-10 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                "{mode === "OCR_PROCESSING" ? currentGuidance.reading : currentGuidance.welcome}"
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] font-extrabold text-sky-700">
                <Volume2 className={`w-3.5 h-3.5 ${avatarMood === "SPEAKING" ? "animate-pulse" : ""}`} />
                <span>
                  {avatarMood === "SPEAKING"
                    ? "Guiding aloud..."
                    : mode === "OCR_PROCESSING"
                    ? "Reading document..."
                    : "Ready to assist"}
                </span>
              </div>
            </div>

            {/* Preserved Document Guarantee Badge */}
            <div className="mt-5 w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Original Document Stored & Preserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
