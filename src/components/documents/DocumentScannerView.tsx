import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Archive, Camera, FileText, Image as ImageIcon, Loader2, Pill, ScanLine, Upload, X } from 'lucide-react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { OcrExtractedFields } from '../../types';

type ActiveMode = 'upload' | 'camera';
interface ArchivedScan { id: string; title?: string; name?: string; fileName?: string; fileType?: string; fileData?: string; dataUrl?: string; documentType?: string; documentDate?: string; hospitalOrClinic?: string; doctorName?: string; extractedMetadata?: OcrExtractedFields; ocrText?: string; notes?: string; isVerified?: boolean; }

const toDocumentType = (value?: OcrExtractedFields['documentType']) => ({ prescription: 'Prescription', lab_report: 'Laboratory report', biopsy: 'Biopsy Report', discharge_summary: 'Discharge summary', imaging: 'Scan / investigation report' } as Record<string, string>)[value || ''] || 'Other Medical Record';

export const DocumentScannerView: React.FC = () => {
  const { user, addToast } = useApp();
  const patientId = user?.patientData?.id || user?.id || '';
  const [activeMode, setActiveMode] = useState<ActiveMode>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<OcrExtractedFields | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [patientName, setPatientName] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [documentDate, setDocumentDate] = useState('');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [archivedScans, setArchivedScans] = useState<ArchivedScan[]>([]);
  const [previewDoc, setPreviewDoc] = useState<ArchivedScan | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    if (!patientId) return undefined;
    api.getScannedDocuments(patientId).then((docs) => { if (mounted) setArchivedScans(Array.isArray(docs) ? docs : []); }).catch(() => undefined);
    return () => { mounted = false; };
  }, [patientId]);

  const startCamera = async () => {
    const requestId = ++cameraRequestRef.current;
    console.log('[DocumentScanner] camera start', { requestId });
    setCameraError(null);
    const video = videoRef.current;
    console.log('[DocumentScanner] video element', video ? 'found' : 'not found');
    if (!video) {
      setCameraError('Camera preview is still loading. Please try Camera Scan again.');
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera access is not supported by your browser or in this environment.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      console.log('[DocumentScanner] stream obtained', stream.getTracks().map((track) => ({ kind: track.kind, readyState: track.readyState, enabled: track.enabled })));

      if (requestId !== cameraRequestRef.current || activeMode !== 'camera') {
        console.log('[DocumentScanner] stopping stale camera stream');
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      console.log('[DocumentScanner] srcObject assigned', { readyState: video.readyState });

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve) => {
          const onVideoData = () => {
            video.removeEventListener('loadeddata', onVideoData);
            video.removeEventListener('canplay', onVideoData);
            resolve();
          };
          video.addEventListener('loadeddata', onVideoData, { once: true });
          video.addEventListener('canplay', onVideoData, { once: true });
          window.setTimeout(() => {
            video.removeEventListener('loadeddata', onVideoData);
            video.removeEventListener('canplay', onVideoData);
            resolve();
          }, 1500);
        });
      }

      console.log('[DocumentScanner] video.readyState before play', video.readyState);
      try {
        await video.play();
        console.log('[DocumentScanner] video.play success', { readyState: video.readyState });
        setIsCameraActive(true);
      } catch (playError) {
        console.warn('[DocumentScanner] video.play failure', playError, { readyState: video.readyState });
        throw playError;
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(err.message || 'Unable to access device camera. Please upload your document directly using file selection.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    cameraRequestRef.current += 1;
    const videoStream = videoRef.current?.srcObject as MediaStream | null;
    const stream = streamRef.current || videoStream;
    if (stream) {
      console.log('[DocumentScanner] stopping camera tracks', stream.getTracks().map((track) => ({ kind: track.kind, readyState: track.readyState })));
      stream.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeMode !== 'camera') {
      stopCamera();
      return undefined;
    }

    let frame = 0;
    let secondFrame = 0;
    frame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => { void startCamera(); });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(secondFrame);
      stopCamera();
    };
  }, [activeMode]);

  const chooseFile = (file: File) => {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type) && !/\.(pdf|jpe?g|png)$/i.test(file.name)) { setError('Please select a PDF, JPG, JPEG, or PNG document.'); return; }
    if (file.size > 25 * 1024 * 1024) { setError('Please select a document smaller than 25 MB.'); return; }
    setError(null); setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFileData(String(reader.result || ''));
    reader.onerror = () => setError('Unable to read this document. Please try another file.');
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) chooseFile(file); };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d'); if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.92); stopCamera(); setFileData(data); setSelectedFile(new File([], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })); setActiveMode('upload');
  };

  const triggerOcrAnalysis = async () => {
    if (!fileData || !selectedFile) { setError('Select or capture a document before extracting its information.'); return; }
    setError(null); setIsProcessing(true);
    try {
      const result = await api.extractDocumentOcr({ fileData, mimeType: selectedFile.type || 'image/jpeg', fileName: selectedFile.name });
      const fields = (result.extractedFields || {}) as OcrExtractedFields;
      setExtracted(fields); setOcrText(result.ocrText || ''); setPatientName(fields.patientName || ''); setDocumentType(fields.documentType || 'other'); setDocumentDate(fields.documentDate || ''); setHospitalOrClinic(fields.hospitalOrClinic || ''); setDoctorName(fields.doctorName || ''); setNotes(fields.notes || '');
      addToast('Document information extracted. Please verify it before archiving.', 'success');
    } catch (err: any) { setError(err.message || 'Unable to extract information from this document.'); } finally { setIsProcessing(false); }
  };

  const handleSubmit = async () => {
    if (!fileData || !selectedFile) { setError('Select or capture a document before archiving it.'); return; }
    setError(null); setIsSubmitting(true);
    try {
      const result = await api.scanAndImportDocument({ patientId, documentType, title: selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), hospitalOrClinic, doctorName, documentDate, fileName: selectedFile.name, fileType: selectedFile.type || 'image/jpeg', fileData, ocrText, extractedMetadata: { ...(extracted || {}), patientName }, notes });
      const saved = result.document || result.scannedDocument || result;
      setArchivedScans((current) => [saved, ...current]); addToast('Document archived and added to your Medical Timeline.', 'success'); setSelectedFile(null); setFileData(''); setExtracted(null); setOcrText('');
    } catch (err: any) { setError(err.message || 'Unable to archive this document.'); } finally { setIsSubmitting(false); }
  };

  const metadata = extracted || {}; const redFlags = metadata.redFlagsDetected || []; const hasPreview = Boolean(fileData);
  return (
    <div id="document-scanner-view" className="space-y-6">
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFileUpload} className="hidden" />
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Document Scanner</h1><p className="text-sm text-slate-500">Upload or scan medical documents for review.</p></div><Archive className="w-7 h-7 text-teal-600" /></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex gap-2 border-b border-slate-100 pb-3"><button id="tab-upload" type="button" onClick={() => setActiveMode('upload')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeMode === 'upload' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Upload className="inline w-4 h-4 mr-2" />Upload Document</button><button id="tab-camera" type="button" onClick={() => { setActiveMode('camera'); }} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeMode === 'camera' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Camera className="inline w-4 h-4 mr-2" />Camera Scan</button></div>
        {activeMode === 'camera' && <div className="space-y-3"><div className="relative aspect-video max-w-2xl mx-auto overflow-hidden rounded-xl bg-slate-900"><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />{!isCameraActive && <div className="absolute inset-0 flex items-center justify-center text-sm text-white"><ScanLine className="w-6 h-6 mr-2" />Starting camera...</div>}</div>{cameraError && <p className="text-sm text-rose-600">{cameraError}</p>}<div className="flex gap-3"><button type="button" onClick={capturePhoto} disabled={!isCameraActive} className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50"><Camera className="inline w-4 h-4 mr-2" />Capture Document</button><button type="button" onClick={() => setActiveMode('upload')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button></div></div>}
        {activeMode === 'upload' && !hasPreview && <button id="select-document" type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-teal-500"><ImageIcon className="w-10 h-10 mx-auto text-teal-600" /><span className="block mt-2 font-semibold text-slate-700">Select a document to scan</span><span className="block text-xs text-slate-500 mt-1">PDF, JPG, JPEG, or PNG up to 25 MB</span></button>}
        {hasPreview && <div className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-800"><FileText className="inline w-4 h-4 mr-2 text-teal-600" />{selectedFile?.name}</span><button type="button" onClick={() => { setSelectedFile(null); setFileData(''); setExtracted(null); }} className="text-rose-600 text-sm">Remove</button></div><div className="max-h-72 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200">{selectedFile?.type === 'application/pdf' ? <FileText className="w-14 h-14 text-teal-600" /> : <img src={fileData} alt="Document preview" className="max-h-72 object-contain" />}</div><button id="extract-ocr" type="button" onClick={triggerOcrAnalysis} disabled={isProcessing} className="px-4 py-2 bg-sky-600 text-white rounded-lg disabled:opacity-60">{isProcessing ? <Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="inline w-4 h-4 mr-2" />}Extract Information</button></div>}
        {error && <p className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</p>}
      </div>
      {extracted && <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5"><h2 className="font-bold text-slate-900">Extracted Information</h2>{redFlags.length > 0 && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800"><AlertTriangle className="inline w-4 h-4 mr-2" /><strong>Red-flag alerts:</strong> {redFlags.join(', ')}</div>}<div className="grid md:grid-cols-2 gap-4"><label className="text-sm text-slate-600">Extracted patient name<input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label><label className="text-sm text-slate-600">Document type<input value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label><label className="text-sm text-slate-600">Document date<input value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label><label className="text-sm text-slate-600">Hospital / clinic<input value={hospitalOrClinic} onChange={(e) => setHospitalOrClinic(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label><label className="text-sm text-slate-600">Doctor name<input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label><label className="text-sm text-slate-600">Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-slate-900" /></label></div>{metadata.labParameters?.length ? <div><h3 className="font-semibold text-slate-800">Lab parameters</h3><div className="mt-2 space-y-1 text-sm text-slate-600">{metadata.labParameters.map((lab, index) => <div key={`${lab.parameter}-${index}`} className="flex justify-between border-b border-slate-100 py-2"><span>{lab.parameter}</span><span>{lab.value} {lab.unit || ''} {lab.status ? `(${lab.status})` : ''}</span></div>)}</div></div> : null}{metadata.medicines?.length ? <div><h3 className="font-semibold text-slate-800"><Pill className="inline w-4 h-4 mr-2" />Medicines</h3><p className="text-sm text-slate-600 mt-2">{metadata.medicines.map((medicine) => `${medicine.name}${medicine.dosage ? ` - ${medicine.dosage}` : ''}`).join(', ')}</p></div> : null}{metadata.biopsyFindings && <div><h3 className="font-semibold text-slate-800">Biopsy findings</h3><p className="text-sm text-slate-600 mt-2">{metadata.biopsyFindings.diagnosis || metadata.biopsyFindings.specimen || 'Findings extracted for review.'}</p></div>}<button id="archive-document" type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-60">{isSubmitting ? 'Archiving...' : <><Archive className="inline w-4 h-4 mr-2" />Archive / Add to Medical Timeline</>}</button></div>}
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-900 mb-4">Archived scans ({archivedScans.length})</h2>{archivedScans.length === 0 ? <p className="text-sm text-slate-500">No archived scans yet.</p> : <div className="space-y-2">{archivedScans.map((doc) => <div key={doc.id} className="flex items-center justify-between border-b border-slate-100 py-3"><div><p className="font-semibold text-sm text-slate-800">{doc.title || doc.name || doc.fileName}</p><p className="text-xs text-slate-500">{toDocumentType(doc.extractedMetadata?.documentType || doc.documentType as OcrExtractedFields['documentType'])} {doc.documentDate ? `• ${doc.documentDate}` : ''}</p></div><button type="button" onClick={() => setPreviewDoc(doc)} className="text-sm text-teal-700 font-semibold">Preview</button></div>)}</div>}</div>
      <AnimatePresence>{previewDoc && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60" onClick={() => setPreviewDoc(null)}><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(event) => event.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><h3 className="font-bold text-slate-900 text-sm">{previewDoc.title || previewDoc.name}</h3><span className="text-xs text-amber-700 font-semibold">Document Scan Preview (Status: Unverified by hospital)</span></div><button type="button" onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-4 min-h-[300px]">{previewDoc.dataUrl?.startsWith('data:image') || previewDoc.fileData?.startsWith('data:image') ? <img src={previewDoc.dataUrl || previewDoc.fileData} alt="Document Scan" className="max-h-[60vh] object-contain rounded-lg" /> : <div className="text-center p-8 space-y-3"><FileText className="w-16 h-16 mx-auto text-teal-600" /><p className="text-xs text-slate-600 font-medium">PDF Document Archive ({previewDoc.name || previewDoc.fileName})</p><a href={previewDoc.dataUrl || previewDoc.fileData} download={previewDoc.name || previewDoc.fileName || 'scanned-document.pdf'} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg">Download / Open PDF</a></div>}</div><div className="flex justify-end"><button type="button" onClick={() => setPreviewDoc(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">Close Preview</button></div></motion.div></div>}</AnimatePresence>
    </div>
  );
};
